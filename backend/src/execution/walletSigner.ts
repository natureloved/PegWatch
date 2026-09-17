/**
 * PegWatch Wallet Signer: Dynamic Delegated / Server Wallet Signer
 */

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

export class AgentWalletSigner {
  private account: any;
  public address: `0x${string}`;

  constructor() {
    let privateKey = process.env.AGENT_SIGNER_PRIVATE_KEY as `0x${string}` | undefined;
    if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
      // Deterministic fallback dev key for consistent local demo testing
      privateKey = "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567" as `0x${string}`;
    }

    this.account = privateKeyToAccount(privateKey);
    this.address = this.account.address;
  }

  /**
   * Signs EIP-712 typed data payload returned by Definitive Flash API
   */
  public async signFlashTypedData(typedData: {
    domain: any;
    types: any;
    primaryType: string;
    message: any;
  }): Promise<`0x${string}`> {
    return await this.account.signTypedData({
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });
  }

  /**
   * Signs arbitrary text message
   */
  public async signMessage(message: string): Promise<`0x${string}`> {
    return await this.account.signMessage({ message });
  }
}
