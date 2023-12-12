import { useCallback, useState } from "react";
import {
  SigningCosmWasmClient,
  setupWasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { toBase64, fromBase64, toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { HttpBatchClient, Tendermint34Client, Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { QueryClient } from "@cosmjs/stargate";
import { 
  getChainConfig,
} from "../services/chainConfig";
import {
  ChainType
} from "../pages/api/check";

export const getBatchClient = async (chain: ChainType) => {
  const thisChain = getChainConfig(chain);
  const endpoints = [thisChain.rpc];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const httpBatch = new HttpBatchClient(endpoint);
  const tmint = await Tendermint37Client.create(httpBatch);
  const queryClient = QueryClient.withExtensions(tmint, setupWasmExtension);
  return queryClient;
}

export function toBinary(obj: any): string {
  return toBase64(toUtf8(JSON.stringify(obj)));
}

export function fromBinary(base64: string): any {
  return JSON.parse(fromUtf8(fromBase64(base64)));
}
