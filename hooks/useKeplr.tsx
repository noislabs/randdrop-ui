import { useCallback, useEffect } from 'react';
import { useSigningClient } from '../contexts/cosmwasm';

export const useKeplr = () => {
  const { walletAddress, signingClient, nickname, connectWallet, disconnect } =
    useSigningClient();

  const handleConnect = () => {
    if (walletAddress.length < 3) {
      connectWallet();
    } else {
      disconnect();
    }
  };

  const reconnect = useCallback(() => {
    disconnect();
    connectWallet();
  }, [disconnect, connectWallet]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", reconnect);

    return () => {
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, [reconnect]);

  return { walletAddress, signingClient, nickname, handleConnect };
}