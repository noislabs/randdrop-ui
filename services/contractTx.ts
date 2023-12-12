import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { Coin } from "@keplr-wallet/types";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgExecuteContractCompat } from "@injectivelabs/sdk-ts";
import { toUtf8 } from "@cosmjs/encoding";

export const randdropClaimMsg = (
  {
    wallet,
    contract,
    amount,
    proof,
  }: {
    wallet: string;
    contract: string;
    amount: string;
    proof: string[];
  },
  funds?: Coin[]
): MsgExecuteContractEncodeObject => {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: wallet,
      contract: contract,
      msg: toUtf8(
        JSON.stringify({
          participate: {
            amount: amount,
            proof: proof,
          },
        })
      ),
      funds,
    }),
  };
};

export const randdropInjectiveClaimMsg = (
  {
    wallet,
    contract,
    amount,
    proof,
  }: {
    wallet: string;
    contract: string;
    amount: string;
    proof: string[];
  },
  funds?: Coin[]
): MsgExecuteContractCompat => {
  return MsgExecuteContractCompat.fromJSON({
    sender: wallet,
    contractAddress: contract,
    exec: {
      action: "participate",
      msg: {
        amount: amount,
        proof: proof,
      },
    },
    funds,
  });
};
