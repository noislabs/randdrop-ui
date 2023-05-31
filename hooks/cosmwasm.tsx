import { useCallback, useContext, useState } from "react";
import { 
  getKeplr, 
  suggestChain 
} from "../services/keplr";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
  setupWasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate/build/fee";
import { toBase64, fromBase64, toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClient } from "@cosmjs/stargate";
// import { getChainConfig, stargazeChainConfig } from "../services/chainConfig";
import { ChainSelectContext, availableChain } from "../contexts/chainSelect";
import { 
  getChainConfig, 
} from "../services/chainConfig";

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
  const { currentChain, changeChain } = useContext(ChainSelectContext);
  const thisChain = getChainConfig(currentChain);

  const [walletAddress, setWalletAddress] = useState("");
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [nickname, setNickname] = useState("");

  const connectWallet = useCallback(async () => {
    setLoading(true);

    try {

      const chainId = thisChain.chainId;
      const keplr = await getKeplr();
      suggestChain(currentChain);

      await keplr.enable(chainId);

      const offlineSigner = await keplr.getOfflineSigner(chainId);

      const endpoint = thisChain.rpc;
      const client = await SigningCosmWasmClient.connectWithSigner(
        endpoint,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(
            `${thisChain.feeCurrencies[0].gasPriceStep?.average}${thisChain.currencies[0].coinMinimalDenom}`
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
  }, [currentChain]);

  const disconnect = useCallback(() => {
    if (signingClient) {
      signingClient.disconnect();
    }
    setWalletAddress("");
    setNickname("");
    setSigningClient(null);
    setLoading(false);
  }, [currentChain]);

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


export const getBatchClient = async (chain: availableChain) => {
  //const { currentChain, changeChain } = useContext(ChainSelectContext);
  const thisChain = getChainConfig(chain);
  const endpoints = [thisChain.rpc];
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