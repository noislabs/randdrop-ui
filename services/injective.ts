import {
  WalletStrategy,
  Wallet,
  MsgBroadcaster,
} from "@injectivelabs/wallet-ts";
import { ChainSigningClient, WalletType } from "../contexts/userClients";
import { getChainConfig } from "./chainConfig";
import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";
import { Network } from "@injectivelabs/networks";
import { randdropInjectiveClaimMsg } from "./contractTx";

let walletStrategy: WalletStrategy;
let msgBroadcaster: MsgBroadcaster;

export const getInjectiveClients = (client: ChainSigningClient) => {
  const chainConfig = getChainConfig(client.chain);

  if (walletStrategy && msgBroadcaster) {
    return { walletStrategy, msgBroadcaster };
  }

  if ( client.walletType === "metamask") {
    walletStrategy = new WalletStrategy({
      chainId:
        chainConfig.chainId === "injective-888"
          ? ChainId.Testnet
          : ChainId.Mainnet,
      wallet: Wallet.Metamask,
      disabledWallets: [
        Wallet.Keplr,
        Wallet.Leap,
        Wallet.Cosmostation,
        Wallet.Ledger,
        Wallet.LedgerCosmos,
        Wallet.LedgerLegacy,
        Wallet.WalletConnect,
        Wallet.Ninji,
        Wallet.Phantom,
        Wallet.Torus,
        Wallet.TrustWallet,
        Wallet.Trezor,
      ],
    });
  
    msgBroadcaster = new MsgBroadcaster({
      walletStrategy,
      network:
        chainConfig.chainId === "injective-888"
          ? Network.TestnetSentry
          : Network.MainnetSentry,
      simulateTx: true,
    });
  } else {
  walletStrategy = new WalletStrategy({
    chainId:
      chainConfig.chainId === "injective-888"
        ? ChainId.Testnet
        : ChainId.Mainnet,
    wallet: Wallet.Keplr,
    disabledWallets: [
      Wallet.Cosmostation,
      Wallet.Ledger,
      Wallet.LedgerCosmos,
      Wallet.LedgerLegacy,
      Wallet.WalletConnect,
      Wallet.Ninji,
      Wallet.Phantom,
      Wallet.Torus,
      Wallet.TrustWallet,
      Wallet.Trezor,
    ],
  });

  msgBroadcaster = new MsgBroadcaster({
    walletStrategy,
    network:
      chainConfig.chainId === "injective-888"
        ? Network.TestnetSentry
        : Network.MainnetSentry,
    simulateTx: true,
  });
  } 

  return { walletStrategy, msgBroadcaster };
};

export const signSendAndBroadcastOnInjective = async ({
  client,
  wallet,
  message,
}: {
  client: ChainSigningClient;
  wallet: WalletType;
  message: {
    wallet: string;
    contract: string;
    amount: string;
    proof: string[];
  };
}) => {
  const { msgBroadcaster, walletStrategy } = getInjectiveClients(client);

  walletStrategy.setWallet(wallet === "keplr" ? Wallet.Keplr : Wallet.Leap);

  return msgBroadcaster.broadcast({
    injectiveAddress: message.wallet,
    msgs: [randdropInjectiveClaimMsg(message)],
  });
};

export const signSendAndBroadcastOnInjectiveEthereum = async ({
  client,
  wallet,
  message,
}: {
  client: ChainSigningClient;
  wallet: WalletType;
  message: {
    wallet: string;
    contract: string;
    amount: string;
    proof: string[];
  };
}) => {
  const { msgBroadcaster, walletStrategy } = getInjectiveClients(client);

  walletStrategy.setWallet(Wallet.Metamask);

  return msgBroadcaster.broadcast({
    injectiveAddress: message.wallet,
    msgs: [randdropInjectiveClaimMsg(message)],
  });
};