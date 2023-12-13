import { toast } from "react-hot-toast";
import { 
  noisChainConfig,
  junoChainConfig,
  stargazeChainConfig,
  injectiveChainConfig,
  auraChainConfig,
  osmosisChainConfig,
  uniChainConfig
} from "./chainConfig";
import { Keplr } from "@keplr-wallet/types";
import { ChainType } from "../pages/api/check";

declare global {
  interface Window {
    keplr: Keplr | undefined;
    leap: Keplr | undefined;
  }
}

interface CosmosKeplrWindow extends Window {
  keplr: Keplr | undefined;
  leap: Keplr | undefined;
  getOfflineSigner: Function;
}

declare let window: CosmosKeplrWindow;

let keplr: Keplr | undefined;
let leap: Keplr | undefined;

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
  keplr = gotKeplr;

  return gotKeplr;
}

export async function getLeap(): Promise<Keplr> {
  let gotLeap: Keplr | undefined;

  if (leap) {
    gotLeap = leap;
  } else if (window.leap) {
    gotLeap = window.leap;
  } else if (document.readyState === "complete") {
    gotLeap = window.leap;
  } else {
    gotLeap = await new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve(window.leap);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  if (!gotLeap) throw new Error("Leap not found");
  leap = gotLeap;

  return gotLeap;
}

export async function suggestChainKeplr(chain: ChainType): Promise<void> {
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
    case "osmosis": {
      try {
        await keplr.experimentalSuggestChain(osmosisChainConfig);
      } catch {
        toast.error("Failed to add Osmosis to Keplr");
      };
      break;
    }
  }
}

export async function suggestChainLeap(chain: ChainType): Promise<void> {
  const leap = await getLeap();
  switch (chain) {
    case "uni": {
      try {
        await leap.experimentalSuggestChain(uniChainConfig);
      } catch {
        toast.error("Failed to add Juno Testnet to leap");
      };
      break;
    }
    case "juno": {
      try {
        await leap.experimentalSuggestChain(junoChainConfig);
      } catch {
        toast.error("Failed to add Juno to leap");
      };
      break;
    }
    case "stargaze": {
      try {
        await leap.experimentalSuggestChain(stargazeChainConfig);
      } catch {
        toast.error("Failed to add Stargaze to leap");
      };
      break;
    }
    case "injective": {
      try {
        await leap.experimentalSuggestChain(injectiveChainConfig);
      } catch {
        toast.error("Failed to add Injective to leap");
      };
      break;
    }
    case "aura": {
      try {
        await leap.experimentalSuggestChain(auraChainConfig);
      } catch {
        toast.error("Failed to add Aura to leap");
      };
      break;
    }
    case "osmosis": {
      try {
        await leap.experimentalSuggestChain(osmosisChainConfig);
      } catch {
        toast.error("Failed to add Osmosis to leap");
      };
      break;
    }
  }
}
