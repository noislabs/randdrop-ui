import { MsgExecuteContractEncodeObject, WasmExtension } from "@cosmjs/cosmwasm-stargate";
import { QueryClient } from "@cosmjs/stargate";
import { Coin } from "@keplr-wallet/types";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";

//const AirdropContractAddress = "nois19kfv6wdsmudx58a2hsktvegvtuyc4rakpsfsxqgmzg26p8ph4yrsteche4";
const AirdropContractAddress = "nois14wa2glah9t3c6x3cnfz2ys5t9er6zcrcvfvq8h0tfcv867q8n8tskvdplc";


export const claimAirdropMessage = ({
  sender,
  amount,
  proof
}:{
  sender: string;
  amount: string;
  proof: string[];
}, funds?: Coin[]): MsgExecuteContractEncodeObject => {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: sender,
      contract: AirdropContractAddress,
      msg: toUtf8(JSON.stringify({
        claim: {
          amount,
          proof,
        },
      })),
      funds
    })
  };
}

export interface ClaimedProps {
  walletAddress: string,
  batchClient: QueryClient & WasmExtension,
}

export const checkClaimed = async ({walletAddress, batchClient}: ClaimedProps) => {

  const res = await batchClient?.wasm.queryContractSmart(
    AirdropContractAddress,
    {
      is_claimed: {
        address: walletAddress
      }
    }
  );
  return res.is_claimed as boolean;
}