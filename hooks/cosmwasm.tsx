import { useState } from "react";
import { getKeplr, suggestChain } from "../util/keplr";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
  setupWasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate/build/fee";
import { toBase64, fromBase64, toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClient } from "@cosmjs/stargate";
import { noisChainConfig } from "../services/noisConfig";
export interface ISigningCosmWasmClientContext {
  walletAddress: string;
  signingClient: SigningCosmWasmClient | null;
  loading: boolean;
  error: any;
  nickname: string;
  connectWallet: any;
  disconnect: Function;
}

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [nickname, setNickname] = useState("");

  const connectWallet = async () => {
    setLoading(true);

    try {
      const chainId = noisChainConfig.chainId;
      const keplr = await getKeplr();
      suggestChain();

      // enable website to access keplr
      await keplr.enable(chainId);

      // get offline signer for signing txs
      const offlineSigner = await keplr.getOfflineSigner(chainId);

      const endpoint = noisChainConfig.rpc;
      const client = await SigningCosmWasmClient.connectWithSigner(
        endpoint,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(
            `${noisChainConfig.feeCurrencies[0].gasPriceStep?.average}${noisChainConfig.currencies[0].coinMinimalDenom}`
          ),
        }
      );

      setSigningClient(client);

      // get user address
      const [{ address }] = await offlineSigner.getAccounts();
      setWalletAddress(address);

      //get user wallet nickname
      const nicky = await keplr.getKey(chainId);
      setNickname(nicky.name);

      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  const disconnect = () => {
    if (signingClient) {
      signingClient.disconnect();
    }
    setWalletAddress("");
    setNickname("");
    setSigningClient(null);
    setLoading(false);
  };

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    nickname,
    connectWallet,
    disconnect,
  };
};


export const getBatchClient = async () => {
  const endpoints = [noisChainConfig.rpc];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const httpBatch = new HttpBatchClient(endpoint);
  const tmint = await Tendermint34Client.create(httpBatch);
  const queryClient = QueryClient.withExtensions(tmint, setupWasmExtension);
  return queryClient;
}

export function toBinary(obj: any): string {
  return toBase64(toUtf8(JSON.stringify(obj)));
}

export function fromBinary(base64: string): any {
  return JSON.parse(fromUtf8(fromBase64(base64)));
}