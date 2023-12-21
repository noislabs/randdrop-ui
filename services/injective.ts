import {
  WalletStrategy,
  Wallet,
  MsgBroadcaster,
} from "@injectivelabs/wallet-ts";
import { ChainSigningClient, WalletType } from "../contexts/userClients";
import { getChainConfig } from "./chainConfig";
import { ChainId } from "@injectivelabs/ts-types";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { randdropInjectiveClaimMsg } from "./contractTx";

let walletStrategy: WalletStrategy;
let msgBroadcaster: MsgBroadcaster;

export const getInjectiveClients = (client: ChainSigningClient) => {
  const chainConfig = getChainConfig(client.chain);

  if (walletStrategy && msgBroadcaster) {
    return { walletStrategy, msgBroadcaster };
  }

  if (client.walletType === "metamask") {
    // TODO: need to choose the right endpoint for metamask
    const endpoint = getNetworkEndpoints(Network.MainnetSentry);

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
      ethereumOptions: {
        ethereumChainId: 888,
        rpcUrl: endpoint.rpc,
      },
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

  switch (wallet) {
    case "keplr":
      walletStrategy.setWallet(Wallet.Keplr);
      break;
    case "leap":
      walletStrategy.setWallet(Wallet.Leap);
      break;
    case "metamask":
      walletStrategy.setWallet(Wallet.Metamask);
    default:
      break;
  }

  // broadcast but actually signandbroadcast
  return msgBroadcaster.broadcast({
    injectiveAddress: message.wallet,
    msgs: [randdropInjectiveClaimMsg(message)],
  });
};
