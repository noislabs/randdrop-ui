import { useCallback, useState } from "react";
import { 
  getKeplr, 
} from "../services/keplr";
import {
  SigningCosmWasmClient,
  setupWasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate/build/fee";
import { toBase64, fromBase64, toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { HttpBatchClient, Tendermint34Client, Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { QueryClient } from "@cosmjs/stargate";
import { 
  getChainConfig,
} from "../services/chainConfig";
import { toast } from "react-hot-toast";
import {
  ChainType
} from "../pages/api/check";

const chains: ChainType[] = ["uni", "juno", "injective", "stargaze", "aura"];

export interface ChainSigningClient {
  chain: ChainType;
  walletAddress: string;
  signingClient: SigningCosmWasmClient;
}

export interface UserSigningClientsContext {
  uniClient?: ChainSigningClient;
  junoClient?: ChainSigningClient;
  injectiveClient?: ChainSigningClient;
  stargazeClient?: ChainSigningClient;
  auraClient?: ChainSigningClient;
  loading: boolean;
  nickname: string;
  connectAll: any;
  disconnectAll: Function;
}

export const useAllSigningClients = (): UserSigningClientsContext => {
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [userSigningClients, setUserSigningClients] = useState<ChainSigningClient[] | undefined>();

  const connectAll = useCallback(async () => {
    setLoading(true);
    const keplr = await getKeplr();
    // Connect user to all chains
    for (const chain of chains) {
      try {
        let chainInfo = getChainConfig(chain);
        await keplr.experimentalSuggestChain(chainInfo);
        await keplr.enable(chainInfo.chainId);
        const offlineSigner = await keplr.getOfflineSigner(chainInfo.chainId);
        const client = await SigningCosmWasmClient.connectWithSigner(
          chainInfo.rpc,
          offlineSigner,
          {
            gasPrice: GasPrice.fromString(
              `${chainInfo.feeCurrencies[0].gasPriceStep?.average}${chainInfo.currencies[0].coinMinimalDenom}`
            ),
          }
        );
        const [{ address }] = await offlineSigner.getAccounts();  
        const nickname = await keplr.getKey(chainInfo.chainId);
        setNickname(nickname.name);

        const chainClient = {
          chain: chain,
          walletAddress: address,
          signingClient: client,
        } as ChainSigningClient;

        setUserSigningClients((old) => old ? [...old, chainClient] : [chainClient]);
      } catch(e) {
        console.log(`Error connecting to ${chain}`);
        console.log(`ERR: ${e}`);
        toast.error(`Error connecting to ${chain}`);
      }
    };
    setLoading(false);
  }, [])

  const disconnectAll = useCallback(() => {
    setLoading(true);
    if (userSigningClients) {
      for (const client of userSigningClients) {
        client.signingClient.disconnect();
      }
    }
    setUserSigningClients(undefined);
    setNickname("");
    setLoading(false);
  }, []);

  return {
    uniClient: userSigningClients?.find((c) => c.chain === "uni"),
    junoClient: userSigningClients?.find((c) => c.chain === "juno"),
    injectiveClient: userSigningClients?.find((c) => c.chain === "injective"),
    stargazeClient: userSigningClients?.find((c) => c.chain === "stargaze"),
    auraClient: userSigningClients?.find((c) => c.chain === "aura"),
    loading,
    nickname,
    connectAll,
    disconnectAll
  };
}


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