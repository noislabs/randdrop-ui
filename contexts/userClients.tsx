import { createContext, useContext, ReactNode, useState, useMemo, useCallback } from "react";
import {
  //UserSigningClientsContext,
  useAllSigningClients,
  useAllSigningClientsLeap,
} from "../hooks/cosmwasm";
//import { WalletType } from "../hooks/useKeplr";
import { ChainType } from "../pages/api/check";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { getChainConfig } from "../services/chainConfig";
import { getKeplr, getLeap } from "../services/keplr";
import { toast } from "react-hot-toast";
import { HdPath, Slip10RawIndex } from "@cosmjs/crypto";

const chains: ChainType[] = ["uni", "juno", "injective", "stargaze", "aura"];
type WalletType = "keplr" | "leap" | "ledger";
interface ChainSigningClient {
  //walletType: "ledger" | "not_ledger",
  walletType: WalletType;
  chain: ChainType;
  walletAddress: string;
  signingClient?: SigningCosmWasmClient;
  ledgerClient?: LedgerSigner;
}

interface UserSigningClientsContext {
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

// outer context stores the walletType

// inner context stores the signing clients etc.

// inside the inner context:
// export const MultiClientProvider = ({
//   children
// }:{
//   children: ReactNode;
// }) => {
//   const walletType = useContext(WalletTypeContext);
//   const {uniClient, junoClient...} = useMemo(() => {
//     call FUNCTION (not hook) that takes in walletType, and returns
//     the correct clients
//
//   }, [walletType])
//   return <ClientsProvider value={value}>{children}</ClientsProvider>
// }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Outer "walletType" context
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

type WalletSelectContextType = {
  currentWalletType: WalletType;
  changeWalletType: (newWallet: WalletType) => void;
}

export const WalletSelectContext = createContext<WalletSelectContextType>({
  currentWalletType: "keplr",
  changeWalletType: (newWallet: WalletType) => {}
});

export const WalletSelectProvider = ({children}:{children: ReactNode}) => {
  const [walletType, setWalletType] = useState<WalletType>("keplr");
  const handleChangeWalletType = (newWallet: WalletType) => {
    setWalletType(newWallet);
  }
  return (
    <WalletSelectContext.Provider
      value={{ currentWalletType: walletType, changeWalletType: handleChangeWalletType }}
    >
      {children}
    </WalletSelectContext.Provider>
  );
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Inner SigningClients context
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let AllClientsContext: any;
let { Provider: ClientsProvider } = (AllClientsContext = 
  createContext<UserSigningClientsContext>({
    uniClient: undefined,
    junoClient: undefined,
    injectiveClient: undefined,
    stargazeClient: undefined,
    auraClient: undefined,
    loading: false,
    nickname: "",
    connectAll: () => {},
    disconnectAll: () => {}
  }));

// export const useAllClients = (): UserSigningClientsContext => 
//   useContext(AllClientsContext);
const MultiClientProvider = ({
  children
}:{
  children: ReactNode;
}) => {
  const {currentWalletType, changeWalletType} = useContext(WalletSelectContext);

  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [userSigningClients, setUserSigningClients] = useState<ChainSigningClient[] | undefined>();

  const connectAll = useCallback(async () => {
    setLoading(true);
    let wallet: any;
    // Remove any previous clients
    setUserSigningClients(undefined);
    switch (currentWalletType) {
      case "ledger": {
        // async function that returns Ledger clients
        for (const chain of chains) {
          try {
            // Get Ledger offline signer
            let ledgerOffline = await getLedgerUsbClient(chain);
            // update clients & nickname (nickname for ledger is just LedgerUSB)
            setNickname(ledgerOffline.nickname);
            setUserSigningClients((old) => old ? [...old, ledgerOffline.client] : [ledgerOffline.client]);

          } catch(e) {
            console.log(e);
            toast.error(`Problem establishing LedgerUSB connection to ${chain}`);
          }
        }
      }
      case "keplr": {
        // async function that returns Keplr wallet clients
        for (const chain of chains) {
          try {
            // Suggest/connect/return client & nickname
            let client = await getKeplrClient(chain);
            // update userSigningClients &nickname
            setNickname(client.nickname);
            setUserSigningClients((old) => old ? [...old, client.client] : [client.client]);

          } catch(e) {
            console.log(e);
            toast.error(`Problem connecting Keplr to ${chain}`);
          }
        }
      }
      case "leap": {
        // async function that returns leap wallet clients
        for (const chain of chains) {
          try {
            // Suggest/connect/return client& nickname
            let client = await getLeapClient(chain);
            // update clients & nickname
            setNickname(client.nickname);
            setUserSigningClients((old) => old? [...old, client.client] : [client.client]);
          } catch(e) {
            console.log(e);
            toast.error(`Problem connecting Leap to ${chain}`);
          }
        }
      }
    }

    setLoading(false);
  }, [currentWalletType])

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


  // const userClients = useMemo(() => {
  //   // If currentWalletType is "ledger", create ledger clients & return
  //   if (currentWalletType === "ledger") {
  //     const ledgerSigners = getLedgerSigners();
  //     return ledgerSigners;
  //   } else {
  //     // else, create normal clients & return
  //     const normalSigners = useAllSigningClients(currentWalletType);
  //     return normalSigners
  //   }
  // }, [currentWalletType]);

  return <ClientsProvider value={userClients}>{children}</ClientsProvider>
}

const getKeplrClient = async (chain: ChainType) => {
  const keplr = await getKeplr()
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
  const chainClient = {
    chain: chain,
    walletAddress: address,
    signingClient: client,
    walletType: "keplr",
  } as ChainSigningClient;

  return {
    client: chainClient,
    nickname: nickname.name
  }
}

const getLeapClient = async (chain: ChainType) => {
  const leap = await getLeap();
  let chainInfo = getChainConfig(chain);
  await leap.experimentalSuggestChain(chainInfo);
  await leap.enable(chainInfo.chainId);
  const offlineSigner = await leap.getOfflineSigner(chainInfo.chainId);
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
  const nickname = await leap.getKey(chainInfo.chainId);
  const chainClient = {
    chain: chain,
    walletAddress: address,
    signingClient: client,
    walletType: "leap",
  } as ChainSigningClient;

  return {
    client: chainClient,
    nickname: nickname.name
  }
}

const getLedgerUsbClient = async (chain: ChainType) => {
  // Setting up ledger connection, 2 minute timeouts
  const ledgerTransport = await TransportWebUSB.create(120_000, 120_000);

  // Getting Signer values depending on the chain
  // Get chainInfo
  let chainInfo = getChainConfig(chain);
  // Get chain prefix addr
  let prefix = chainInfo.bech32Config.bech32PrefixAccAddr;
  // Injective uses the Ethereum cointype (60) rather than Cosmos (118)
  let hdPaths: HdPath[] = [];
  if (chain === "injective") {
    hdPaths = [makeEthereumPath(0)];
  } else {
    hdPaths = [makeCosmosPath(0)];
  }
  // Setting up the LedgerSigner will also be different for injective - TODO
  // Setup signer
  const offlineSigner = new LedgerSigner(ledgerTransport, {
    hdPaths: hdPaths,
    prefix: prefix
  });

  const addressAndKey = await offlineSigner.showAddress();

  const chainClient = {
    chain: chain,
    walletAddress: addressAndKey.address,
    ledgerClient: offlineSigner,
    walletType: "ledger",
  } as ChainSigningClient;

  return {
    client: chainClient,
    nickname: "LedgerUSB"
  }

}

/**
 * The Cosmos Hub derivation path in the form `m/44'/118'/0'/0/a`
 * with 0-based account index `a`.
 */
export function makeCosmosPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(118),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}

/**
 * Ethereum Path for Inejctive in the form `m/44'/60'/0'/0/a'
 * with 0 based account idx
 * 44' = purpose, Injective uses SLIP44 so it's still 44'
 * 60' = coin_type 
 * 0' = assumes account 0
 * 0 = receiving address (1 is change address)
 */
export function makeEthereumPath(a: number): HdPath {
  return [
    // purpose'
    Slip10RawIndex.hardened(44),
    // coin_type'
    Slip10RawIndex.hardened(60),
    // account'
    Slip10RawIndex.hardened(0),
    // change
    Slip10RawIndex.normal(0),
    // address_index
    Slip10RawIndex.normal(a),
  ];
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Function that connects & returns non-ledger signer (keplr / leap)
const useAllSigningClients = (wallet: "keplr" | "leap"): UserSigningClientsContext => {
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





// const useAllSigningClients = (): UserSigningClientsContext => {
//   const [loading, setLoading] = useState(false);
//   const [nickname, setNickname] = useState("");
//   const [userSigningClients, setUserSigningClients] = useState<ChainSigningClient[] | undefined>();

//   const connectAll = useCallback(async () => {
//     setLoading(true);
//     const keplr = await getKeplr();
//     // Connect user to all chains
//     for (const chain of chains) {
//       try {
//         let chainInfo = getChainConfig(chain);
//         await keplr.experimentalSuggestChain(chainInfo);
//         await keplr.enable(chainInfo.chainId);
//         const offlineSigner = await keplr.getOfflineSigner(chainInfo.chainId);
//         const client = await SigningCosmWasmClient.connectWithSigner(
//           chainInfo.rpc,
//           offlineSigner,
//           {
//             gasPrice: GasPrice.fromString(
//               `${chainInfo.feeCurrencies[0].gasPriceStep?.average}${chainInfo.currencies[0].coinMinimalDenom}`
//             ),
//           }
//         );
//         const [{ address }] = await offlineSigner.getAccounts();  
//         const nickname = await keplr.getKey(chainInfo.chainId);
//         setNickname(nickname.name);

//         const chainClient = {
//           chain: chain,
//           walletAddress: address,
//           signingClient: client,
//         } as ChainSigningClient;

//         setUserSigningClients((old) => old ? [...old, chainClient] : [chainClient]);
//       } catch(e) {
//         console.log(`Error connecting to ${chain}`);
//         console.log(`ERR: ${e}`);
//         toast.error(`Error connecting to ${chain}`);
//       }
//     };
//     setLoading(false);
//   }, [])

//   const disconnectAll = useCallback(() => {
//     setLoading(true);
//     if (userSigningClients) {
//       for (const client of userSigningClients) {
//         client.signingClient.disconnect();
//       }
//     }
//     setUserSigningClients(undefined);
//     setNickname("");
//     setLoading(false);
//   }, []);

//   return {
//     uniClient: userSigningClients?.find((c) => c.chain === "uni"),
//     junoClient: userSigningClients?.find((c) => c.chain === "juno"),
//     injectiveClient: userSigningClients?.find((c) => c.chain === "injective"),
//     stargazeClient: userSigningClients?.find((c) => c.chain === "stargaze"),
//     auraClient: userSigningClients?.find((c) => c.chain === "aura"),
//     loading,
//     nickname,
//     connectAll,
//     disconnectAll
//   };

// }




// let AllClientsContext: any;
// let { Provider: ClientsProvider } = (AllClientsContext = 
//   createContext<UserSigningClientsContext>({
//     uniClient: undefined,
//     junoClient: undefined,
//     injectiveClient: undefined,
//     stargazeClient: undefined,
//     auraClient: undefined,
//     loading: false,
//     nickname: "",
//     connectAll: () => {},
//     disconnectAll: () => {}
//   }));

// export const useAllClients = (): UserSigningClientsContext => 
//   useContext(AllClientsContext);

// export const MultiClientProvider = ({
//   children
// }:{
//   children: ReactNode;
// }) => {
//   const value = useAllSigningClients();
//   return <ClientsProvider value={value}>{children}</ClientsProvider>
// }