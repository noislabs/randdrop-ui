import { useCallback, useEffect } from 'react';
import { useAllSigningClients } from './cosmwasm';

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
  } = useAllSigningClients();

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