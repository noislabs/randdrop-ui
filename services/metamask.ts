// import { CheckResponse } from "../pages/api/check";
// import { ChainSigningClient } from "../contexts/userClients";
// import {
//     getInjectiveAddress,
//     ChainRestAuthApi,
//     ChainRestTendermintApi,
//     BaseAccount,
//     getEip712TypedData,
//     createTransaction,
//     hexToBase64,
//     recoverTypedSignaturePubKey,
//     SIGN_AMINO,
//     createWeb3Extension,
//     createTxRawEIP712, 
//     TxRestClient,
//     hexToBuff,
// } from '@injectivelabs/sdk-ts'
// import {
//     BigNumberInBase,
//     DEFAULT_STD_FEE,
//     DEFAULT_BLOCK_TIMEOUT_HEIGHT,
// } from '@injectivelabs/utils'
// import { randdropInjectiveClaimMsg } from "./contractTx";
// import { window } from "../contexts/userClients";
// import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'

// export const metamaskTxHelper = async ({
//     client,
//     checkResponse
// }: {
//     client: ChainSigningClient;
//     checkResponse: CheckResponse;
// }) => {
//     const injectiveAddress = getInjectiveAddress(client.walletAddress)
//     const chainId = 'injective-1' /* ChainId.Mainnet */
//     const restEndpoint =
//         'https://lcd.injective.network' /* getNetworkEndpoints(Network.Mainnet).rest */

//     // ** Account Details ** /
//     const chainRestAuthApi = new ChainRestAuthApi(restEndpoint)
//     const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
//         injectiveAddress,
//     )
//     const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse)
//     const accountDetails = baseAccount.toAccountDetails()

//     /** Block Details */
//     const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint)
//     const latestBlock = await chainRestTendermintApi.fetchLatestBlock()
//     const latestHeight = latestBlock.header.height
//     const timeoutHeight = new BigNumberInBase(latestHeight).plus(
//         DEFAULT_BLOCK_TIMEOUT_HEIGHT,
//     )


//     const message = {
//         wallet: client.walletAddress,
//         contract: checkResponse.claim_contract ?? "x",
//         amount: checkResponse.amount,
//         proof: checkResponse.proof
//     }
//     /** Preparing the transaction */
//     const msgs = [randdropInjectiveClaimMsg(message)]

//     /** EIP712 for signing on Ethereum wallets */
//     const eip712TypedData = getEip712TypedData({
//         msgs,
//         tx: {
//             accountNumber: accountDetails.accountNumber.toString(),
//             sequence: accountDetails.sequence.toString(),
//             timeoutHeight: timeoutHeight.toFixed(),
//             chainId: chainId,
//         },
//         ethereumChainId: ethereumChainId,
//     })

//     /** Use your preferred approach to sign EIP712 TypedData, example with Metamask */
//     const signature = await window.ethereum.request({
//         method: 'eth_signTypedData_v4',
//         params: [client.walletAddress, JSON.stringify(eip712TypedData)],
//     })
//     const signatureBuff = hexToBuff(signature)

//     /** Get Public Key of the signer */
//     const publicKeyHex = recoverTypedSignaturePubKey(eip712TypedData, signature)
//     const publicKeyBase64 = hexToBase64(publicKeyHex)

//     const { txRaw } = createTransaction({
//         message: msgs,
//         memo: "",
//         signMode: SIGN_AMINO,
//         fee: DEFAULT_STD_FEE,
//         pubKey: publicKeyBase64,
//         sequence: baseAccount.sequence,
//         timeoutHeight: timeoutHeight.toNumber(),
//         accountNumber: baseAccount.accountNumber,
//         chainId: chainId,
//     })
//     const web3Extension = createWeb3Extension({
//         ethereumChainId,
//     })
//     const txRawEip712 = createTxRawEIP712(txRaw, web3Extension)

//     /** Append Signatures */
//     txRawEip712.signatures = [signatureBuff]

//     /** Broadcast the Transaction */
//     const txRestClient = new TxRestClient(restEndpoint)

//     const response = await txRestClient.broadcast(txRawEip712)
//     await txRestClient.fetchTxPoll(response.txHash)
// }