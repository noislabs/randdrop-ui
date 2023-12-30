import { useCallback, useState } from "react";
import { setupWasmExtension } from "@cosmjs/cosmwasm-stargate";
import { setupBankExtension } from "@cosmjs/stargate";
import { toBase64, fromBase64, toUtf8, fromUtf8 } from "@cosmjs/encoding";
import {
  HttpBatchClient,
  Tendermint34Client,
  Tendermint37Client,
} from "@cosmjs/tendermint-rpc";
import { QueryClient } from "@cosmjs/stargate";
import { getChainConfig } from "../services/chainConfig";
import { ChainType } from "../pages/api/check";

export const getBatchClient = async (chain: ChainType) => {
  const thisChain = getChainConfig(chain);
  const endpoints = [thisChain.rpc];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const httpBatch = new HttpBatchClient(endpoint);
  const tmint = await Tendermint37Client.create(httpBatch);
  const queryClient = QueryClient.withExtensions(tmint, setupWasmExtension);
  return queryClient;
};

const getBankClient = async (chain: ChainType) => {
  const thisChain = getChainConfig(chain);
  const endpoints = [thisChain.rpc];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const httpBatch = new HttpBatchClient(endpoint);
  const tmint = await Tendermint37Client.create(httpBatch);
  const queryClient = QueryClient.withExtensions(tmint, setupBankExtension);
  return queryClient;
};

export function toBinary(obj: any): string {
  return toBase64(toUtf8(JSON.stringify(obj)));
}

export function fromBinary(base64: string): any {
  return JSON.parse(fromUtf8(fromBase64(base64)));
}

async function queryContractBalance(
  chain: ChainType,
  contractAddress: string
): Promise<number> {
  // get client with bank extension
  const batchClient = await getBankClient(chain);

  // Query contract's total NOIS token balances

  const balances = await batchClient.bank.allBalances(contractAddress);

  // Find the NOIS token balance, handling both native and IBC denoms
  // Assuming the contract has only NOIS tokens (also be in the form of ibc denom)
  const noisTokenIdentifier = "unois";
  const noisBalance = balances.find(
    (balance) =>
      balance.denom === noisTokenIdentifier || balance.denom.includes("ibc")
  );
  return noisBalance ? parseInt(noisBalance.amount) : 0;
}

export async function calculatePercentage(
  chain: ChainType,
  contractAddress: string
): Promise<number> {
  // Total amount to be distributed per chain (in unois)
  const totalDistribution = {
    osmosis: 4_000_000_000_000,
    injective: 4_100_000_000_000,
    juno: 2_600_000_000_000,
    stargaze: 1_200_000_000_000,
    aura: 100_000_000_000,
  };

  const balance = await queryContractBalance(chain, contractAddress);

  // Calculate the percentage of NOIS tokens left
  const totalForChain = totalDistribution[chain];
  const percentageLeft = (balance / totalForChain) * 100;

  return percentageLeft;
}
