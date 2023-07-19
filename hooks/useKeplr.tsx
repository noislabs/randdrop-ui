import { useCallback, useEffect, useState, useContext } from 'react';
import { useAllSigningClientsKeplr, useAllSigningClientsLeap } from './cosmwasm';
import { WalletSelectContext } from "../contexts/cosmwasm"
import { toast } from 'react-hot-toast';

export type WalletType = "keplr" | "leap";

export const useMultiWallet = () => {

  const { currentWalletType, changeWalletType } = useContext(WalletSelectContext);
  
  const {
    uniClient: keplrUniClient,
    junoClient: keplrJunoClient,
    injectiveClient: keplrInjectiveClient,
    stargazeClient: keplrStargazeClient,
    auraClient: keplrAuraClient,
    loading: keplrLoading,
    nickname: keplrNickname,
    connectAll: keplrConnectAll,
    disconnectAll: keplrDisconnectAll
  } = useAllSigningClientsKeplr();

  const {
    uniClient: leapUniClient,
    junoClient: leapJunoClient,
    injectiveClient: leapInjectiveClient,
    stargazeClient: leapStargazeClient,
    auraClient: leapAuraClient,
    loading: leapLoading,
    nickname: leapNickname,
    connectAll: leapConnectAll,
    disconnectAll: leapDisconnectAll
  } = useAllSigningClientsLeap();

  const handleConnectAll = useCallback(() => {
    switch (currentWalletType) {
      case "keplr": {
        toast.success("called handleConnectAll")
        leapDisconnectAll();
        if ([keplrUniClient, keplrJunoClient, keplrInjectiveClient, keplrStargazeClient, keplrAuraClient].some((v) => v != undefined)) {
          toast.error("Disconnecting keplr clients");
          keplrDisconnectAll();
        } else {
          toast.success("Connecting keplr clients")
          keplrConnectAll();
        }
      }
      case "leap": {
        keplrDisconnectAll();
        if ([leapUniClient, leapJunoClient, leapInjectiveClient, leapStargazeClient, leapAuraClient].some((v) => v != undefined)) {
          leapDisconnectAll();
        } else {
          leapConnectAll();
        }
      }
    
      default:
        break;
    }
  }, [currentWalletType]);

  // const handleConnectAll = () => {
  //   if ([uniClient, junoClient, injectiveClient, stargazeClient, auraClient].some((v) => v != undefined)) {
  //     disconnectAll();
  //   } else {
  //     connectAll();
  //   }
  // };

  const keyStoreChanged = () => {
    keplrDisconnectAll();
    leapDisconnectAll();
  }

  // const reconnect = useCallback(() => {
  //   disconnectAll();
  //   connectAll();
  // }, [disconnectAll, connectAll]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", keyStoreChanged);
    window.addEventListener("leap_keystorechange", keyStoreChanged);

    return () => {
      window.removeEventListener("keplr_keystorechange", keyStoreChanged);
      window.removeEventListener("leap_keystorechange", keyStoreChanged);
      //window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, []);

  if (currentWalletType === "keplr") {
    return {
      uniClient: keplrUniClient,
      junoClient: keplrJunoClient,
      injectiveClient: keplrInjectiveClient,
      stargazeClient: keplrStargazeClient,
      auraClient: keplrAuraClient,
      loading: keplrLoading,
      nickname: keplrNickname,
      handleConnectAll,
      disconnectAll: keplrDisconnectAll
    }
  } else {
    return {
      uniClient: leapUniClient,
      junoClient: leapJunoClient,
      injectiveClient: leapInjectiveClient,
      stargazeClient: leapStargazeClient,
      auraClient: leapAuraClient,
      loading: leapLoading,
      nickname: leapNickname,
      handleConnectAll,
      disconnectAll: leapDisconnectAll
    }
  }
  // return {
  //   uniClient,
  //   junoClient,
  //   injectiveClient,
  //   stargazeClient,
  //   auraClient,
  //   loading,
  //   nickname,
  //   handleConnectAll,
  //   disconnectAll
  // };

}


// Inside page component, create useCallback that changes based on wallet type
// FLOW:
// 1) User clicks which wallet they want to connect
// 2) That changes a useState variable of the wallet type
// 3) useCallback has dependency array of that variable
// function inside usecallback is this:
const xx = () => {
  const [walletType, setWalletType] = useState<WalletType>("keplr");
  
  const connectAWallet = useCallback(() => {
    return useMultiWalletTest(walletType);
  }, [walletType])

}
export const useMultiWalletTest = (walletType: WalletType): number => {
  return 14
}




export const useMultiKeplr = () => {
  const {
    uniClient,
    junoClient,
    injectiveClient,
    stargazeClient,
    auraClient,
    loading,
    nickname,
    connectAll,
    disconnectAll
  } = useAllSigningClientsKeplr();

  const handleConnectAll = () => {
    if ([uniClient, junoClient, injectiveClient, stargazeClient, auraClient].some((v) => v != undefined)) {
      disconnectAll();
    } else {
      connectAll();
    }
  };

  const reconnect = useCallback(() => {
    disconnectAll();
    connectAll();
  }, [disconnectAll, connectAll]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", reconnect);

    return () => {
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, [reconnect]);

  return {
    uniClient,
    junoClient,
    injectiveClient,
    stargazeClient,
    auraClient,
    loading,
    nickname,
    handleConnectAll,
    disconnectAll
  };
}