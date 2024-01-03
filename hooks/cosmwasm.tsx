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

  // Mapping of known IBC denoms to their chains
  const ibcDenoms = {
    'stargaze-1': 'ibc/0F181D9F5BB18A8496153C1666E934169515592C135E8E9FCCC355889858EAF9',
    'juno-1': 'ibc/1D9E14A1F00613ED39E4B8A8763A20C9BE5B5EA0198F2FE47EAE43CD91A0137B',
    'injective-1': 'ibc/DD9182E8E2B13C89D6B4707C7B43E8DB6193F9FF486AFA0E6CF86B427B0D231A',
    'aura': 'ibc/1FD48481DAA1B05575FE6D3E35929264437B8424A73243B207BCB67401C7F1FD',
    'osmosis': 'ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90'
  };

  // Find the NOIS token balance, handling both native and IBC denoms
  const noisTokenIdentifier = "unois";
  const noisBalance = balances.find((balance) => {
    return (
      balance.denom === noisTokenIdentifier ||
      Object.values(ibcDenoms).includes(balance.denom)
    )});

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
