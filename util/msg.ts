import { MsgExecuteContractEncodeObject, SigningCosmWasmClient, WasmExtension } from "@cosmjs/cosmwasm-stargate";
import { QueryClient } from "@cosmjs/stargate";
import { Coin } from "@keplr-wallet/types";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import toast from "react-hot-toast";
import { availableChain } from "../contexts/chainSelect";
import { getAddressTable } from "./addressConversion";
import { Airdrop } from "@/lib/airdrop";

// const UniAirdropContractAddress = "juno140p2gyzfq7h0n36x8ldzcytjqtm5cj654gr9ema8sz8au2xf82nq9qvzez";
const UniAirdropContractAddress = "juno1r0cqh70f7r0t8gw2gmxnlfnnu83s4gs0jcydwng8frft4evl54js4tw60g";

//--------------------------------------------------------------------
// Queries
//--------------------------------------------------------------------

const AirdropRegistryUrls = {
  "juno": 'https://gist.githubusercontent.com/kaisbaccour/5a2f102ef476d533a3112b016aa45db4/raw/aa94b4d6682536ac518d1e98367b6bbc0eac5740/juno-randdrop.json',
  "injective": 'https://gist.githubusercontent.com/kaisbaccour/c26ede9d4219896bc03fb0fdfce310a3/raw/fa0825eb75607afad08ffb0fdead8567795150ad/injective-randdrop.json',
  "stargaze": 'https://gist.githubusercontent.com/kaisbaccour/ac8002e0329b4f54407e702c5dc4aa47/raw/1c8a75bdabf3dc04f77ed0d2c1cefedbba4fa060/stargaze-randdrop.json',
  "aura": 'https://gist.githubusercontent.com/kaisbaccour/edf03e2486d1f6a609e2d8918cfcb4a9/raw/99ce180cc8e082615d0c010e0192d3d829693c48/aura-randdrop.json'
}

interface EligibleTable {
  amount: string,
  proof: string[]
}

/** Check users eligible amount from gists, return Amount and Merkle Proof */
export const checkEligibleAmount = async ({
  walletAddress,
  chain,
}:{
  walletAddress: string;
  chain: availableChain;
}) => {
  const addrTable = getAddressTable(walletAddress);

  const validAddress = addrTable[chain];

  if (validAddress.length < 3) {
    toast.error("Error: Invalid input address");
    return;
  }

  const url = AirdropRegistryUrls[chain];

  const randDropData = await fetch (url);
  const chainData = await randDropData.json();
  const airdrop = new Airdrop(chainData);
  const userDrop = chainData.find((obj) => obj.address === validAddress);

  if (userDrop) {
    const userEligibleAmt = String(userDrop.amount * 3);
    const proof = airdrop.getMerkleProof({
      address: validAddress,
      amount: userEligibleAmt
    });
    toast.dismiss();
    return {
      amount: userEligibleAmt,
      proof
    } as EligibleTable
  } else {
    toast.dismiss();
    toast.error("No claim available | Account not eligible");
    return undefined;
  }
}

/** Query `airdropContract` to check if wallet won a Randdrop */
export const isLucky = async ({
  walletAddress,
  batchClient,
  airdropContract = UniAirdropContractAddress
}:{
  walletAddress: string;
  batchClient: QueryClient & WasmExtension;
  airdropContract?: string;
}) => {
  const res = await batchClient.wasm.queryContractSmart(
    airdropContract,
    {
      is_lucky: {
        address: walletAddress
      }
    }
  );
  return res.is_lucky as boolean;
}

/** Query `airdropContract` to check if wallet has already claimed a Randdrop */
export const checkClaimed = async ({
  walletAddress,
  batchClient,
  airdropContract = UniAirdropContractAddress
}:{
  walletAddress: string;
  batchClient: QueryClient & WasmExtension;
  airdropContract?: string;
}) => {

  const res = await batchClient?.wasm.queryContractSmart(
    airdropContract,
    {
      is_claimed: {
        address: walletAddress
      }
    }
  );
  return res.is_claimed as boolean;
}

// Check if lucky, then check if claimed, if they pass then get eligible amount and return it
export const fullCheck = async ({
  walletAddress,
  batchClient,
  chain,
  airdropContract = UniAirdropContractAddress
}:{
  walletAddress: string;
  batchClient: QueryClient & WasmExtension;
  chain: availableChain;
  airdropContract?: string;
}) => {

  const amt_and_proof = await checkEligibleAmount({walletAddress, chain});
  if (!amt_and_proof) {
    toast.dismiss();
    toast.error("No claim available | Account not eligible");
    return undefined;
  }

  const is_lucky = await isLucky({walletAddress, batchClient, airdropContract});
  if (!is_lucky) {
    toast.dismiss();
    toast.error("No claim available | Account was eligible, but did not win");
    return undefined;
  }

  const has_claimed = await checkClaimed({walletAddress, batchClient, airdropContract});
  if (has_claimed) {
    toast.dismiss();
    toast.error("No claim available | Randdrop already claimed");
    return undefined;
  }

  toast.dismiss();
  return amt_and_proof;

}

//--------------------------------------------------------------------
// Executes
//--------------------------------------------------------------------

/** Create an Airdrop Claim Message */
const claimAirdropMessage = ({
  walletAddress,
  amount,
  proof,
  airdropContract = UniAirdropContractAddress
}:{
  walletAddress: string;
  amount: string;
  proof: string[];
  airdropContract?: string;
}): MsgExecuteContractEncodeObject => {
  const funds: Coin[] = [];
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: walletAddress,
      contract: airdropContract,
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

/** Execute an Airdrop Claim */
export const claimAirdrop = async ({
  walletAddress,
  amount,
  proof,
  batchClient,
  signingClient,
  airdropContract = UniAirdropContractAddress
}:{
  walletAddress: string;
  amount: string;
  proof: string[];
  batchClient: QueryClient & WasmExtension;
  signingClient: SigningCosmWasmClient;
  airdropContract?: string;
}) => {

  if (proof.length < 1) {
    toast.error("No claim available");
    return;
  }

  const checkLucky = await isLucky({walletAddress, batchClient, airdropContract});

  if (checkLucky === false) {
    toast.error("No claim available");
    return;
  }

  const checkHasClaimed = await checkClaimed({walletAddress, batchClient, airdropContract});

  if (checkHasClaimed === true) {
    toast.error("Randdrop already claimed");
    return;
  }

  const claimMessage = [claimAirdropMessage({walletAddress, amount, proof, airdropContract})];

  signingClient
    .signAndBroadcast(walletAddress, claimMessage, 'auto')
    .then((res) => {
      console.log("TX hash: " + res.transactionHash);
      toast.dismiss();
      toast.success("Rand-drop claimed!");
      //confetti ?
    })
    .catch((e) => {
      console.log(e);
      toast.dismiss();
      toast.error("Error claiming Rand-drop");
      toast.error(JSON.stringify(e.message));
    });
}
