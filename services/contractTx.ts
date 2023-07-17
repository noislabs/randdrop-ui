import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { Coin } from "@keplr-wallet/types";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";

export const randdropClaimMsg = ({
  wallet,
  contract,
  amount,
  proof,
}:{
  wallet: string;
  contract: string;
  amount: string;
  proof: string[]
}): MsgExecuteContractEncodeObject => {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: wallet,
      contract: contract,
      msg: toUtf8(JSON.stringify({
        participate: {
          amount: amount,
          proof: proof
        }
      }))
    })
  }
}



// const claimRewardsMsg = ({
//   sender,
//   round_id
// }:{
//   sender: string;
//   round_id: string[];
// }, funds?: Coin[]): MsgExecuteContractEncodeObject => {
//   return {
//     typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
//     value: MsgExecuteContract.fromPartial({
//       sender: sender,
//       contract: PredMarketAddress,
//       msg: toUtf8(JSON.stringify({
//         collect_winnings: {
//           rounds: round_id
//         }
//       })),
//       funds
//     })
//   };
// }