import { ChainType, CheckResponse } from "../services/apiHelpers";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { toBase64 } from "@cosmjs/encoding";
import { getChainConfig } from "../services/chainConfig";
import { HdPath, Slip10RawIndex } from "@cosmjs/crypto";
import { 
  MsgExecuteContract, 
  DEFAULT_STD_FEE,
  domainHash,
  messageHash,
  createTransaction,
  SIGN_AMINO,
  createTxRawEIP712,
  createWeb3Extension,
  TxRestClient,
  getEip712TypedData,
  Eip712ConvertTxArgs,
  Eip712ConvertFeeArgs,
} from "@injectivelabs/sdk-ts";
import { EthereumChainId } from "@injectivelabs/ts-types";
import { ChainSigningClient } from "../contexts/userClients";
import { bufferToHex } from 'ethereumjs-util';
import { getInjectiveAddress } from "@injectivelabs/sdk-ts";

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Ethereum Ledger helpers for Injective
//https://github.com/InjectiveLabs/injective-ts/blob/master/.gitbook/transactions/ethereum-ledger.md
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const DEFAULT_BLOCK_TIMEOUT_HEIGHT = 90;

/**
 * - Builds tx
 * - Prompts user to sign tx
 * - Packs tx for CosmosSDK
 * - Broadcasts tx to `getChainConfig(client.chain).rest`
 */
export const ethLedgerTxHelper = async ({
  client,
  checkResponse
}:{
  client: ChainSigningClient;
  checkResponse: CheckResponse;
}) => {

  // Throw err if no claim_contract or ethLedgerClient
  if (!checkResponse.claim_contract) throw new Error("No claim_contract exists on checkResponse");
  if (!client.ethLedgerClient) throw new Error("No ethLedgerClient available");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Building the transaction
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Get chain config
  const chainConfig = getChainConfig(client.chain);

  // Get query client, don't really need batch here since creating batch requires 2 trips anyway
  const queryClient = await CosmWasmClient.connect(chainConfig.rpc);

  // check if input address start with 0x
  if (client.walletAddress.startsWith("0x")) {
    client.walletAddress = getInjectiveAddress(client.walletAddress);
  }

  // Get account sequence of user
  const {accountNumber, sequence} = await queryClient.getSequence(client.walletAddress);
  console.log('walletAddress: ', client.walletAddress);

  // Get latest block info
  const latestBlock = await queryClient.getBlock();
  const lastHeight = latestBlock.header.height;
  const timeoutHeight = lastHeight + DEFAULT_BLOCK_TIMEOUT_HEIGHT;

  // Create tx args
  const txArgs: Eip712ConvertTxArgs = {
    accountNumber: accountNumber.toString(),
    sequence: sequence.toString(),
    timeoutHeight: timeoutHeight.toFixed(),
    chainId: chainConfig.chainId,
  }
  const txFeeArgs: Eip712ConvertFeeArgs = DEFAULT_STD_FEE;
  const ethereumChainId = EthereumChainId.Mainnet;
  const randdropContract = checkResponse.claim_contract;

  // Create CosmWasm execute message
  const executeMsg = MsgExecuteContract.fromJSON({
    sender: client.walletAddress,
    contractAddress: randdropContract,
    msg: {
      participate: {
        amount: checkResponse.amount,
        proof: checkResponse.proof
      }
    }
  });

  // eip712 typed data to be signed/broadcasted with Ledger
  const eip712TypedData = getEip712TypedData({
    msgs: executeMsg,
    tx: txArgs,
    fee: txFeeArgs,
    ethereumChainId: ethereumChainId
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Signing the transaction
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Have user sign msg with Ledger
  const result = await client.ethLedgerClient.ethApp.signEIP712HashedMessage(
    "44'/60'/0'/0/0",
    bufferToHex(domainHash(eip712TypedData)),
    bufferToHex(messageHash(eip712TypedData)),
  );

  // Construct signature
  const combined = `${result.r}${result.s}${result.v.toString(16)}`
  const signature = combined.startsWith('0x') ? combined : `0x${combined}`

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Preparing the transaction
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const { txRaw } = createTransaction({
    message: executeMsg,
    memo: '',
    signMode: SIGN_AMINO,
    fee: DEFAULT_STD_FEE,
    pubKey: client.ethLedgerClient.pubKey,
    sequence: sequence,
    timeoutHeight: timeoutHeight,
    accountNumber: accountNumber,
    chainId: ethereumChainId.toString(),
  });

  const web3Extension = createWeb3Extension({
    ethereumChainId,
  });

  const txRawEip712 = createTxRawEIP712(txRaw, web3Extension);
  
  // Appending signature
  const signatureBuff = Buffer.from(signature.replace('0x', ''), 'hex')
  txRawEip712.signatures = [signatureBuff]
  
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Broadcasting the transaction
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  
  const txRestClient = new TxRestClient(chainConfig.rest);
  const response = await txRestClient.broadcast(txRawEip712)

  if (response.code !== 0) {
    throw new Error(`Transaction failed: ${response.rawLog}`)
  }

  return response.txHash;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Paths  |  makeCosmosPath (118) and makeEthereumPath (60, Injective)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * The Cosmos Hub derivation path in the form `m/44'/118'/0'/0/a`
 * with 0-based account index `a`.
 */
export function makeCosmosPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(118),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}

/**
 * Ethereum Path for Inejctive in the form `m/44'/60'/0'/0/a'
 * with 0 based account idx
 * 44' = purpose, Injective uses SLIP44 so it's still 44'
 * 60' = coin_type 
 * 0' = assumes account 0
 * 0 = receiving address (1 is change address)
 */
export function makeEthereumPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(60),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}
