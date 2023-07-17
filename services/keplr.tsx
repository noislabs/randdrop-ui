import { toast } from "react-hot-toast";
import { 
  noisChainConfig,
  junoChainConfig,
  stargazeChainConfig,
  injectiveChainConfig,
  auraChainConfig,
  uniChainConfig
} from "./chainConfig";
import { Keplr } from "@keplr-wallet/types";
import { ChainType } from "../pages/api/check";

declare global {
  interface Window {
    keplr: Keplr | undefined;
  }
}

interface CosmosKeplrWindow extends Window {
  keplr: any;
  getOfflineSigner: Function;
}

declare let window: CosmosKeplrWindow;

let keplr: Keplr | undefined;

export async function getKeplr(): Promise<Keplr> {
  let gotKeplr: Keplr | undefined;

  if (keplr) {
    gotKeplr = keplr;
  } else if (window.keplr) {
    gotKeplr = window.keplr;
  } else if (document.readyState === "complete") {
    gotKeplr = window.keplr;
  } else {
    gotKeplr = await new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  if (!gotKeplr) throw new Error("Keplr not found");
  if (!gotKeplr) keplr = gotKeplr;

  return gotKeplr;
}

export async function suggestChain(chain: ChainType): Promise<void> {
  const keplr = await getKeplr();
  switch (chain) {
    case "uni": {
      try {
        await keplr.experimentalSuggestChain(uniChainConfig);
      } catch {
        toast.error("Failed to add Juno Testnet to Keplr");
      };
      break;
    }
    case "juno": {
      try {
        await keplr.experimentalSuggestChain(junoChainConfig);
      } catch {
        toast.error("Failed to add Juno to Keplr");
      };
      break;
    }
    case "stargaze": {
      try {
        await keplr.experimentalSuggestChain(stargazeChainConfig);
      } catch {
        toast.error("Failed to add Stargaze to Keplr");
      };
      break;
    }
    case "injective": {
      try {
        await keplr.experimentalSuggestChain(injectiveChainConfig);
      } catch {
        toast.error("Failed to add Injective to Keplr");
      };
      break;
    }
    case "aura": {
      try {
        await keplr.experimentalSuggestChain(auraChainConfig);
      } catch {
        toast.error("Failed to add Aura to Keplr");
      };
      break;
    }
  }
}