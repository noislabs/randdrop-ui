import { useCallback, useEffect } from 'react';
import { useAllSigningClientsLeap } from './cosmwasm';

export const useMultiLeap = () => {
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
  } = useAllSigningClientsLeap();

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
    //window.addEventListener("keplr_keystorechange", reconnect);
    window.addEventListener('leap_keystorechange', reconnect);

    return () => {
      window.removeEventListener("leap_keystorechange", reconnect);
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