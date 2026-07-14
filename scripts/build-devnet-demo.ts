/**
 * Real Solana devnet build: Token-2022 ConfidentialTransferMint end to end.
 *
 * Creates a mint with the ConfidentialTransferMint extension (+ an auditor
 * ElGamal key), configures confidential accounts for two wallets, mints and
 * deposits tokens, performs a real confidential transfer between the two
 * wallets, and — using only data fetched back from chain — demonstrates:
 *   1. A public observer sees the accounts and transfer, but the balance and
 *      transfer-amount fields are opaque ciphertext (see the raw base64
 *      blobs captured in evidence/devnet-run.json).
 *   2. Each owner can decrypt their own balance with their own keys
 *      (asserted below).
 *   3. The mint's auditor can decrypt the transferred amount from the
 *      on-chain instruction data using only the auditor's ElGamal key
 *      (asserted below).
 *
 * Run with: npm run build-devnet-demo (requires Node >= 24).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  airdropFactory,
  appendTransactionMessageInstructions,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  createTransactionPlanExecutor,
  createTransactionPlanner,
  devnet,
  generateKeyPairSigner,
  getAddressDecoder,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
  isSome,
  lamports,
  parseInstructionPlanInput,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  some,
  summarizeTransactionPlanResult,
  type Address,
  type InstructionPlanInput,
  type Signature,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';
import {
  TOKEN_2022_PROGRAM_ADDRESS,
  extension,
  fetchToken,
  findAssociatedTokenPda,
  getConfidentialDepositInstruction,
  getConfidentialTransferInstructionDataDecoder,
  getCreateMintInstructionPlan,
  getMintToATAInstructionPlan,
  CONFIDENTIAL_TRANSFER_DISCRIMINATOR,
  CONFIDENTIAL_TRANSFER_CONFIDENTIAL_TRANSFER_DISCRIMINATOR,
  type Token,
} from '@solana-program/token-2022';
import {
  getApplyConfidentialPendingBalanceInstructionFromToken,
  getConfidentialTransferInstructionPlan,
  getCreateConfidentialTransferAccountInstructionPlan,
} from '@solana-program/token-2022/confidential';
import { AeCiphertext, AeKey, ElGamalCiphertext, ElGamalKeypair } from '@solana/zk-sdk/bundler';
import { deriveConfidentialKeys } from './lib/keys.js';
import { loadOrCreateSigner } from './lib/wallets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const KEYPAIR_DIR = join(REPO_ROOT, 'evidence', 'keypairs');
const EVIDENCE_PATH = join(REPO_ROOT, 'evidence', 'devnet-run.json');

const DECIMALS = 2;
const TOTAL_MINTED = 4_000_000n; // 40,000.00 ATLAS-GEQ
const TRANSFER_AMOUNT = 1_500_000n; // 15,000.00 ATLAS-GEQ, Alfa -> Meridian

const RPC_URL = 'https://api.devnet.solana.com';
const RPC_WS_URL = 'wss://api.devnet.solana.com';

function explorerAddress(addr: string) {
  return `https://explorer.solana.com/address/${addr}?cluster=devnet`;
}
function explorerTx(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
function log(phase: string, message: string) {
  console.log(`\n[${phase}] ${message}`);
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`  retryable error (attempt ${attempt}/${attempts}): ${(error as Error).message}`);
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

function requiredConfidentialExtension(token: Token) {
  if (!isSome(token.extensions)) throw new Error('Token account is missing extensions.');
  const found = token.extensions.value.find((e) => e.__kind === 'ConfidentialTransferAccount');
  if (!found) throw new Error('Token account is missing the ConfidentialTransferAccount extension.');
  return found;
}

function decryptAvailableBalance(token: Token, aesKey: AeKey): bigint {
  const ext = requiredConfidentialExtension(token);
  const ciphertext = AeCiphertext.fromBytes(new Uint8Array(ext.decryptableAvailableBalance));
  if (!ciphertext) throw new Error('Failed to deserialize the decryptable available balance.');
  return aesKey.decrypt(ciphertext);
}

function rawAvailableBalanceBase64(token: Token): string {
  const ext = requiredConfidentialExtension(token);
  return Buffer.from(ext.availableBalance).toString('base64');
}

function addressFromElGamalPubkey(keypair: ElGamalKeypair): Address {
  return getAddressDecoder().decode(new Uint8Array(keypair.pubkey().toBytes()));
}

function assertEqual(actual: bigint, expected: bigint, label: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed for ${label}: expected ${expected}, got ${actual}`);
  }
  console.log(`  [assert ok] ${label} === ${expected}`);
}

function formatAmount(amount: bigint, decimals: number): string {
  const s = amount.toString().padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals);
  return `${Number(whole).toLocaleString('en-US')}.${frac}`;
}

async function main() {
  const rpc = createSolanaRpc(devnet(RPC_URL));
  const rpcSubscriptions = createSolanaRpcSubscriptions(devnet(RPC_WS_URL));
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

  // ---------------------------------------------------------------------
  // Phase 0: wallets + funding
  // ---------------------------------------------------------------------
  log('0', 'Loading or creating devnet wallets (persisted so retries reuse the same addresses)');
  const payer = await loadOrCreateSigner(join(KEYPAIR_DIR, 'payer.json'));
  const bancoAlfa = await loadOrCreateSigner(join(KEYPAIR_DIR, 'banco-alfa.json'));
  const bancaMeridian = await loadOrCreateSigner(join(KEYPAIR_DIR, 'banca-meridian.json'));
  console.log(`  payer:          ${payer.address}`);
  console.log(`  Banco Alfa:     ${bancoAlfa.address}`);
  console.log(`  Banca Meridian: ${bancaMeridian.address}`);

  await ensureFunded();
  async function ensureFunded() {
    const MIN_LAMPORTS = 150_000_000n; // 0.15 SOL comfortably covers this whole run's rent + fees
    const { value: balance } = await rpc.getBalance(payer.address).send();
    if (balance >= MIN_LAMPORTS) {
      console.log(`  payer already funded: ${Number(balance) / 1e9} SOL`);
      return;
    }
    const airdrop = airdropFactory({ rpc, rpcSubscriptions });
    const amounts = [2_000_000_000n, 1_000_000_000n, 500_000_000n];
    for (const amount of amounts) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`  requesting airdrop of ${Number(amount) / 1e9} SOL (attempt ${attempt})...`);
          await airdrop({ commitment: 'confirmed', recipientAddress: payer.address, lamports: lamports(amount) });
          const { value: newBalance } = await rpc.getBalance(payer.address).send();
          console.log(`  payer funded: ${Number(newBalance) / 1e9} SOL`);
          return;
        } catch (error) {
          console.warn(`  airdrop attempt failed: ${(error as Error).message}`);
          await sleep(1500 * attempt);
        }
      }
    }

    // Devnet faucets are heavily rate-limited. Fall back to transferring
    // from the local `solana-keygen` CLI wallet, if it already holds
    // devnet SOL (a normal devnet-to-devnet transfer isn't rate-limited).
    console.warn('  airdrop unavailable; falling back to the local Solana CLI keypair as a funding source');
    const cliKeypairPath = join(homedir(), '.config', 'solana', 'id.json');
    if (!existsSync(cliKeypairPath)) {
      throw new Error(
        `Could not airdrop devnet SOL to ${payer.address} automatically (faucet rate-limited) and found no ` +
          `local CLI keypair at ${cliKeypairPath} to fall back on.\n` +
          `Please fund it manually -- e.g. https://faucet.solana.com/ -- then re-run this script.`,
      );
    }
    const cliKeypairBytes = new Uint8Array(JSON.parse(readFileSync(cliKeypairPath, 'utf8')));
    const funder = await createKeyPairSignerFromBytes(cliKeypairBytes);
    const { value: funderBalance } = await rpc.getBalance(funder.address).send();
    const transferAmount = funderBalance > MIN_LAMPORTS + 10_000_000n ? MIN_LAMPORTS : funderBalance - 10_000_000n;
    if (transferAmount <= 0n) {
      throw new Error(
        `Local CLI keypair ${funder.address} does not hold enough devnet SOL to fund ${payer.address} either ` +
          `(has ${Number(funderBalance) / 1e9} SOL). Please fund ${payer.address} manually and re-run.`,
      );
    }
    console.log(`  transferring ${Number(transferAmount) / 1e9} SOL from local CLI wallet ${funder.address}`);
    const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
    const transferMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (m) => setTransactionMessageFeePayerSigner(funder, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => appendTransactionMessageInstructions([getTransferSolInstruction({ source: funder, destination: payer.address, amount: transferAmount })], m),
    );
    const signedTransfer = await signTransactionMessageWithSigners(transferMessage);
    await sendAndConfirmTransaction(signedTransfer as Parameters<typeof sendAndConfirmTransaction>[0], { commitment: 'confirmed' });
    const { value: newBalance } = await rpc.getBalance(payer.address).send();
    console.log(`  payer funded via local CLI wallet transfer: ${Number(newBalance) / 1e9} SOL`);
  }

  // Mint + auditor are fresh every run.
  const mint = await generateKeyPairSigner();
  const auditorKeypair = new ElGamalKeypair();
  const auditorPubkeyAddress = addressFromElGamalPubkey(auditorKeypair);
  console.log(`  mint:           ${mint.address}`);
  console.log(`  auditor ElGamal pubkey (not a wallet): ${auditorPubkeyAddress}`);

  // ---------------------------------------------------------------------
  // Shared transaction planning/execution plumbing
  // ---------------------------------------------------------------------
  const transactionPlanner = createTransactionPlanner({
    createTransactionMessage: async () => {
      const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
      return pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(payer, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      );
    },
  });
  const transactionPlanExecutor = createTransactionPlanExecutor({
    executeTransactionMessage: async (context, message) => {
      const transaction = await signTransactionMessageWithSigners(message);
      context.transaction = transaction;
      await sendAndConfirmTransaction(transaction as Parameters<typeof sendAndConfirmTransaction>[0], { commitment: 'confirmed' });
      return transaction;
    },
  });

  const allSignatures: Record<string, string[]> = {};
  async function runPlan(label: string, planInput: InstructionPlanInput): Promise<string[]> {
    log(label, 'Planning + sending real devnet transaction(s)...');
    const plan = parseInstructionPlanInput(planInput);
    const transactionPlan = await transactionPlanner(plan);
    const result = await transactionPlanExecutor(transactionPlan);
    const summary = summarizeTransactionPlanResult(result);
    if (!summary.successful) {
      const failure = summary.failedTransactions[0];
      throw new Error(`[${label}] transaction failed: ${failure?.error?.message ?? 'unknown error'}`);
    }
    const signatures = summary.successfulTransactions.map((t) => t.context.signature as string);
    allSignatures[label] = signatures;
    for (const sig of signatures) {
      console.log(`  tx: ${explorerTx(sig)}`);
    }
    return signatures;
  }

  // ---------------------------------------------------------------------
  // Phase 1: create the mint with ConfidentialTransferMint + auditor key
  // ---------------------------------------------------------------------
  const createMintPlan = getCreateMintInstructionPlan({
    payer,
    newMint: mint,
    decimals: DECIMALS,
    mintAuthority: payer,
    extensions: [
      extension('ConfidentialTransferMint', {
        authority: some(payer.address),
        autoApproveNewAccounts: true,
        auditorElgamalPubkey: some(auditorPubkeyAddress),
      }),
    ],
  });
  await runPlan('1-create-mint', createMintPlan);

  // ---------------------------------------------------------------------
  // Phase 2: derive confidential keys + create confidential accounts
  // ---------------------------------------------------------------------
  log('2', "Deriving Banco Alfa's and Banca Meridian's ElGamal + AES keys from their own wallet signatures");
  const alfaKeys = await deriveConfidentialKeys(bancoAlfa, bancoAlfa.address, mint.address);
  const meridianKeys = await deriveConfidentialKeys(bancaMeridian, bancaMeridian.address, mint.address);
  console.log(`  Banco Alfa ElGamal pubkey:     ${addressFromElGamalPubkey(alfaKeys.elgamalKeypair)}`);
  console.log(`  Banca Meridian ElGamal pubkey: ${addressFromElGamalPubkey(meridianKeys.elgamalKeypair)}`);

  const [alfaAta] = await findAssociatedTokenPda({ owner: bancoAlfa.address, mint: mint.address, tokenProgram: TOKEN_2022_PROGRAM_ADDRESS });
  const [meridianAta] = await findAssociatedTokenPda({ owner: bancaMeridian.address, mint: mint.address, tokenProgram: TOKEN_2022_PROGRAM_ADDRESS });

  const createAlfaAccountPlan = await getCreateConfidentialTransferAccountInstructionPlan({
    payer,
    owner: bancoAlfa,
    mint: mint.address,
    rpc,
    elgamalKeypair: alfaKeys.elgamalKeypair,
    aesKey: alfaKeys.aesKey,
  });
  await runPlan('2a-configure-alfa-account', createAlfaAccountPlan);

  const createMeridianAccountPlan = await getCreateConfidentialTransferAccountInstructionPlan({
    payer,
    owner: bancaMeridian,
    mint: mint.address,
    rpc,
    elgamalKeypair: meridianKeys.elgamalKeypair,
    aesKey: meridianKeys.aesKey,
  });
  await runPlan('2b-configure-meridian-account', createMeridianAccountPlan);

  // ---------------------------------------------------------------------
  // Phase 3: mint plaintext tokens to Banco Alfa, then move into pending
  // confidential balance
  // ---------------------------------------------------------------------
  const mintToAlfaPlan = getMintToATAInstructionPlan({
    payer,
    ata: alfaAta,
    owner: bancoAlfa.address,
    mint: mint.address,
    mintAuthority: payer,
    amount: TOTAL_MINTED,
    decimals: DECIMALS,
  });
  await runPlan('3-mint-to-alfa', mintToAlfaPlan);

  const depositInstruction = getConfidentialDepositInstruction({
    token: alfaAta,
    mint: mint.address,
    authority: bancoAlfa,
    amount: TOTAL_MINTED,
    decimals: DECIMALS,
  });
  await runPlan('4-deposit-pending-balance', depositInstruction);

  // ---------------------------------------------------------------------
  // Phase 5: apply pending balance for Banco Alfa
  // ---------------------------------------------------------------------
  let alfaAccount = (await fetchToken(rpc, alfaAta)).data;
  const applyAlfaInstruction = getApplyConfidentialPendingBalanceInstructionFromToken({
    token: alfaAta,
    tokenAccount: alfaAccount,
    authority: bancoAlfa,
    elgamalSecretKey: alfaKeys.elgamalKeypair.secret(),
    aesKey: alfaKeys.aesKey,
  });
  await runPlan('5-apply-pending-alfa', applyAlfaInstruction);

  // ---------------------------------------------------------------------
  // Phase 6: decrypt + verify Banco Alfa's available balance
  // ---------------------------------------------------------------------
  alfaAccount = (await fetchToken(rpc, alfaAta)).data;
  const alfaBalanceAfterDeposit = decryptAvailableBalance(alfaAccount, alfaKeys.aesKey);
  log('6', `Decrypted Banco Alfa's available balance with her own AES key: ${alfaBalanceAfterDeposit}`);
  assertEqual(alfaBalanceAfterDeposit, TOTAL_MINTED, "Banco Alfa's available balance after deposit");

  // ---------------------------------------------------------------------
  // Phase 7: real confidential transfer, Banco Alfa -> Banca Meridian
  // ---------------------------------------------------------------------
  const meridianAccountBeforeTransfer = (await fetchToken(rpc, meridianAta)).data;
  const transferPlan = await getConfidentialTransferInstructionPlan({
    payer,
    rpc,
    sourceToken: alfaAta,
    destinationToken: meridianAta,
    mint: mint.address,
    sourceTokenAccount: alfaAccount,
    destinationTokenAccount: meridianAccountBeforeTransfer,
    auditorElgamalPubkey: auditorPubkeyAddress,
    authority: bancoAlfa,
    amount: TRANSFER_AMOUNT,
    sourceElgamalKeypair: alfaKeys.elgamalKeypair,
    aesKey: alfaKeys.aesKey,
  });
  const transferSignatures = await runPlan('7-confidential-transfer', transferPlan);

  // ---------------------------------------------------------------------
  // Phase 8: apply pending balance for Banca Meridian (the recipient)
  // ---------------------------------------------------------------------
  const meridianAccountAfterTransfer = (await fetchToken(rpc, meridianAta)).data;
  const applyMeridianInstruction = getApplyConfidentialPendingBalanceInstructionFromToken({
    token: meridianAta,
    tokenAccount: meridianAccountAfterTransfer,
    authority: bancaMeridian,
    elgamalSecretKey: meridianKeys.elgamalKeypair.secret(),
    aesKey: meridianKeys.aesKey,
  });
  await runPlan('8-apply-pending-meridian', applyMeridianInstruction);

  // ---------------------------------------------------------------------
  // Phase 9: decrypt + verify both final balances
  // ---------------------------------------------------------------------
  const alfaAccountFinal = (await fetchToken(rpc, alfaAta)).data;
  const meridianAccountFinal = (await fetchToken(rpc, meridianAta)).data;
  const alfaFinalBalance = decryptAvailableBalance(alfaAccountFinal, alfaKeys.aesKey);
  const meridianFinalBalance = decryptAvailableBalance(meridianAccountFinal, meridianKeys.aesKey);
  log('9', `Banco Alfa final balance (decrypted with her own key):     ${alfaFinalBalance}`);
  log('9', `Banca Meridian final balance (decrypted with her own key): ${meridianFinalBalance}`);
  assertEqual(alfaFinalBalance, TOTAL_MINTED - TRANSFER_AMOUNT, "Banco Alfa's final balance");
  assertEqual(meridianFinalBalance, TRANSFER_AMOUNT, "Banca Meridian's final balance");
  assertEqual(alfaFinalBalance + meridianFinalBalance, TOTAL_MINTED, 'conservation of total balance');

  // ---------------------------------------------------------------------
  // Phase 10: the auditor decrypts the transfer amount from CHAIN DATA ONLY
  // ---------------------------------------------------------------------
  log('10', "Fetching the confidential-transfer transactions from chain and decrypting the amount with the auditor's key");
  const { amount: auditorDecryptedAmount, signature: transferSignature } = await decryptTransferAmountAsAuditor(
    transferSignatures,
    auditorKeypair,
  );
  async function decryptTransferAmountAsAuditor(
    signatures: string[],
    keypair: ElGamalKeypair,
  ): Promise<{ amount: bigint; signature: string }> {
    const decoder = getConfidentialTransferInstructionDataDecoder();
    const base64Encoder = getBase64Encoder();
    const transactionDecoder = getTransactionDecoder();
    const messageDecoder = getCompiledTransactionMessageDecoder();

    for (const signature of signatures) {
      // Fetch the raw wire bytes rather than jsonParsed: the RPC's built-in
      // parser only partially decodes newer instruction types like
      // ConfidentialTransfer, dropping the raw instruction data we need.
      // Retried: the public devnet RPC occasionally drops the connection mid-request.
      const fetched = await withRetry(() =>
        rpc
          .getTransaction(signature as Signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
            encoding: 'base64',
          })
          .send(),
      );
      if (!fetched) continue;

      const wireBytes = new Uint8Array(base64Encoder.encode(fetched.transaction[0]));
      const { messageBytes } = transactionDecoder.decode(wireBytes);
      const message = messageDecoder.decode(messageBytes);
      if (message.version !== 0) continue; // this script only ever sends v0 transactions

      for (const ix of message.instructions) {
        const programAddress = message.staticAccounts[ix.programAddressIndex];
        if (programAddress !== TOKEN_2022_PROGRAM_ADDRESS || !ix.data || ix.data.length < 2) continue;
        if (ix.data[0] !== CONFIDENTIAL_TRANSFER_DISCRIMINATOR || ix.data[1] !== CONFIDENTIAL_TRANSFER_CONFIDENTIAL_TRANSFER_DISCRIMINATOR) continue;

        const data = decoder.decode(ix.data);
        const lo = ElGamalCiphertext.fromBytes(new Uint8Array(data.transferAmountAuditorCiphertextLo));
        const hi = ElGamalCiphertext.fromBytes(new Uint8Array(data.transferAmountAuditorCiphertextHi));
        if (!lo || !hi) throw new Error('Failed to deserialize the auditor ciphertext from on-chain instruction data.');
        const secret = keypair.secret();
        const amountLo = secret.decrypt(lo);
        const amountHi = secret.decrypt(hi);
        return { amount: (amountHi << 16n) + amountLo, signature };
      }
    }
    throw new Error(`No ConfidentialTransfer instruction found in any of: ${signatures.join(', ')}`);
  }
  console.log(`  Found it in tx ${explorerTx(transferSignature)}`);
  console.log(`  Auditor independently decrypted transfer amount: ${auditorDecryptedAmount}`);
  assertEqual(auditorDecryptedAmount, TRANSFER_AMOUNT, "auditor's decrypted transfer amount");

  // ---------------------------------------------------------------------
  // Evidence
  // ---------------------------------------------------------------------
  const evidence = {
    network: 'devnet',
    generatedAt: new Date().toISOString(),
    decimals: DECIMALS,
    mint: {
      address: mint.address,
      explorer: explorerAddress(mint.address),
      authority: payer.address,
      auditorElgamalPubkey: auditorPubkeyAddress,
    },
    wallets: {
      bancoAlfa: {
        owner: bancoAlfa.address,
        explorer: explorerAddress(bancoAlfa.address),
        tokenAccount: alfaAta,
        tokenAccountExplorer: explorerAddress(alfaAta),
        elgamalPubkey: addressFromElGamalPubkey(alfaKeys.elgamalKeypair),
        finalDecryptedBalance: alfaFinalBalance.toString(),
        finalDecryptedBalanceDisplay: formatAmount(alfaFinalBalance, DECIMALS),
        rawEncryptedAvailableBalanceBase64: rawAvailableBalanceBase64(alfaAccountFinal),
      },
      bancaMeridian: {
        owner: bancaMeridian.address,
        explorer: explorerAddress(bancaMeridian.address),
        tokenAccount: meridianAta,
        tokenAccountExplorer: explorerAddress(meridianAta),
        elgamalPubkey: addressFromElGamalPubkey(meridianKeys.elgamalKeypair),
        finalDecryptedBalance: meridianFinalBalance.toString(),
        finalDecryptedBalanceDisplay: formatAmount(meridianFinalBalance, DECIMALS),
        rawEncryptedAvailableBalanceBase64: rawAvailableBalanceBase64(meridianAccountFinal),
      },
    },
    transfer: {
      amount: TRANSFER_AMOUNT.toString(),
      amountDisplay: formatAmount(TRANSFER_AMOUNT, DECIMALS),
      signature: transferSignature,
      explorer: explorerTx(transferSignature),
      auditorDecryptedAmount: auditorDecryptedAmount.toString(),
      auditorDecryptedAmountDisplay: formatAmount(auditorDecryptedAmount, DECIMALS),
    },
    transactions: allSignatures,
  };
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(EVIDENCE_PATH, JSON.stringify(evidence, null, 2));
  log('done', `Evidence written to ${EVIDENCE_PATH}`);
  console.log('\nAll assertions passed. This was a real devnet run, not a simulation.');
}

main().catch((error) => {
  console.error('\nFAILED:', error);
  process.exitCode = 1;
});
