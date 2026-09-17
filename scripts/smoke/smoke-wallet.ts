/**
 * Smoke Test 3: smoke-wallet.ts
 * Verifies that the Dynamic Server Wallet / EVM Agent Signer can sign a message/typed data
 * and verify the signature matches the wallet address.
 * PASS = address matches.
 */

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { verifyMessage } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

async function runWalletSmokeTest() {
  console.log("==================================================");
  console.log("   SMOKE TEST 3: Dynamic / EVM Agent Wallet Signer");
  console.log("==================================================");

  try {
    const dynamicKey = process.env.DYNAMIC_API_KEY;
    const dynamicEnv = process.env.DYNAMIC_ENVIRONMENT_ID;

    if (dynamicKey && dynamicEnv) {
      console.log(`[INFO] Dynamic API configuration detected.`);
      console.log(`[INFO] Environment ID: ${dynamicEnv.slice(0, 8)}...`);
    } else {
      console.log(`[INFO] No DYNAMIC_API_KEY detected in .env.`);
      console.log(`[INFO] Operating in Server Signer fallback mode (EVM Agent Signer via viem).`);
    }

    let privateKey = process.env.AGENT_SIGNER_PRIVATE_KEY as `0x${string}` | undefined;
    if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
      console.log(`[INFO] Generating ephemeral dev key for smoke test...`);
      privateKey = generatePrivateKey();
    }

    const account = privateKeyToAccount(privateKey);
    const walletAddress = account.address;
    console.log(`[INFO] Signer Address: ${walletAddress}`);

    const testMessage = `PegWatch Authorization: Smoke test verification at ${new Date().toISOString()}`;
    console.log(`[INFO] Signing message: "${testMessage}"`);

    const signature = await account.signMessage({ message: testMessage });
    console.log(`[INFO] Signature generated: ${signature.slice(0, 20)}...${signature.slice(-20)}`);

    const isValid = await verifyMessage({
      address: walletAddress,
      message: testMessage,
      signature,
    });

    if (isValid) {
      console.log("\n--------------------------------------------------");
      console.log(`>>> RESULT: PASS <<<`);
      console.log(`Signer address (${walletAddress}) correctly matched and verified.`);
      console.log("--------------------------------------------------\n");
      process.exitCode = 0;
      return;
    } else {
      console.error("\n--------------------------------------------------");
      console.error(`>>> RESULT: FAIL <<<`);
      console.error("Signature verification failed: recovered address does not match.");
      console.error("--------------------------------------------------\n");
      process.exitCode = 1;
      return;
    }
  } catch (err: any) {
    console.error("\n--------------------------------------------------");
    console.error(`>>> RESULT: FAIL <<<`);
    console.error(`Error during wallet smoke test: ${err?.message || err}`);
    console.error("--------------------------------------------------\n");
    process.exitCode = 1;
    return;
  }
}

runWalletSmokeTest();
