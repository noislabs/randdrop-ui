import { Keplr, ChainInfo } from "@keplr-wallet/types";
import { ChainType } from "../services/apiHelpers";

/**
 * - Returns chainConfig for `chain`
 * - To change Testnet/Mainnet, swap out commented lines
 * */
export const getChainConfig = (chain: ChainType) => {
  switch (chain) {
    case "juno": {
      return junoChainConfig;
    }
    case "stargaze": {
      //testnet
      return stargazeChainConfig;
      //mainnet
      //return stargazeChainConfig;
    }
    case "injective": {
      //testnet
      // return injective888ChainConfig;
      //mainnet
      return injectiveChainConfig;
    }
    case "aura": {
      return auraChainConfig;
    }
    case "osmosis": {
      return osmosisChainConfig;
    }
  }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Chain Infos
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Testnets
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Injective Testnet (injective-888)
export const injective888ChainConfig: ChainInfo = {
  chainId: "injective-888",
  chainName: "injectivetestnet",
  rpc: "https://injective-testnet-rpc.polkachu.com",
  rest: "https://injective-testnet-api.polkachu.com",
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: "inj",
    bech32PrefixAccPub: "injpub",
    bech32PrefixValAddr: "injvaloper",
    bech32PrefixValPub: "injvaloperpub",
    bech32PrefixConsAddr: "injvalcons",
    bech32PrefixConsPub: "injvalconspub",
  },
  currencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "uinj",
      coinDecimals: 18,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "uinj",
      coinDecimals: 6,
      gasPriceStep: {
        low: 500000000,
        average: 1000000000,
        high: 1500000000,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "INJ",
    coinMinimalDenom: "uinj",
    coinDecimals: 18,
  },
  features: ["eth-address-gen", "eth-key-sign"],
};

// Aura Testnet
export const auraTestnetChainConfig: ChainInfo = {
  chainId: "euphoria-2",
  chainName: "auratestnet",
  //chainName: "Aura Xstaxy Mainnet",
  rpc: "https://rpc.euphoria.aura.network",
  rest: "https://lcd.euphoria.aura.network",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "aura",
    bech32PrefixAccPub: "aurapub",
    bech32PrefixValAddr: "auravaloper",
    bech32PrefixValPub: "auravaloperpub",
    bech32PrefixConsAddr: "auravalcons",
    bech32PrefixConsPub: "auravalconspub",
  },
  currencies: [
    {
      coinDenom: "eaura",
      coinMinimalDenom: "uearua",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "eaura",
      coinMinimalDenom: "uearua",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.001,
        average: 0.0025,
        high: 0.004,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "eaura",
    coinMinimalDenom: "ueaura",
    coinDecimals: 6,
  },
  features: [],
};

// Nois Testnet
export const noistestnetChainConfig: ChainInfo = {
  chainId: "nois-testnet-005",
  chainName: "Nois Testnet",
  rpc: "https://nois-testnet-rpc.polkachu.com/",
  rest: "https://nois-004.api.bccnodes.com",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "nois",
    bech32PrefixAccPub: "noispub",
    bech32PrefixValAddr: "noisvaloper",
    bech32PrefixValPub: "noisvaloperpub",
    bech32PrefixConsAddr: "noisvalcons",
    bech32PrefixConsPub: "noisvalconspub",
  },
  currencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NOIS",
    coinMinimalDenom: "unois",
    coinDecimals: 6,
  },
  features: [],
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mainnets
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Juno Mainnet
export const junoChainConfig: ChainInfo = {
  chainId: "juno-1",
  chainName: "juno",
  rpc: "https://juno-rpc.reece.sh",
  rest: "https://juno-rpc.reece.sh:443",
  // rpc: "https://juno-rpc.polkachu.com/",
  // rest: "https://juno-api.polkachu.com:443",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "juno",
    bech32PrefixAccPub: "junopub",
    bech32PrefixValAddr: "junovaloper",
    bech32PrefixValPub: "junovaloperpub",
    bech32PrefixConsAddr: "junovalcons",
    bech32PrefixConsPub: "junovalconspub",
  },
  currencies: [
    {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.075,
        average: 0.075,
        high: 0.075,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "JUNO",
    coinMinimalDenom: "ujuno",
    coinDecimals: 6,
  },
  features: [],
};

// Injective Mainnet
export const injectiveChainConfig: ChainInfo = {
  chainId: "injective-1",
  chainName: "injective",
  rpc: "https://rpc-injective.goldenratiostaking.net",
  rest: "https://injective-api.polkachu.com",
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: "inj",
    bech32PrefixAccPub: "injpub",
    bech32PrefixValAddr: "injvaloper",
    bech32PrefixValPub: "injvaloperpub",
    bech32PrefixConsAddr: "injvalcons",
    bech32PrefixConsPub: "injvalconspub",
  },
  currencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "uinj",
      coinDecimals: 18,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "uinj",
      coinDecimals: 6,
      gasPriceStep: {
        low: 500000000,
        average: 1000000000,
        high: 1500000000,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "INJ",
    coinMinimalDenom: "uinj",
    coinDecimals: 18,
  },
  features: ["eth-address-gen", "eth-key-sign"],
};

// Stargaze Mainnet
export const stargazeChainConfig: ChainInfo = {
  chainId: "stargaze-1",
  chainName: "stargaze",
  rpc: "https://rpc.stargaze-apis.com:443",
  rest: "https://rest.stargaze-apis.com:443",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "stars",
    bech32PrefixAccPub: "starspub",
    bech32PrefixValAddr: "starsvaloper",
    bech32PrefixValPub: "starsvaloperpub",
    bech32PrefixConsAddr: "starsvalcons",
    bech32PrefixConsPub: "starsvalconspub",
  },
  currencies: [
    {
      coinDenom: "STARS",
      coinMinimalDenom: "ustars",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "STARS",
      coinMinimalDenom: "ustars",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "STARS",
    coinMinimalDenom: "ustars",
    coinDecimals: 6,
  },
  features: [],
};

// Aura Mainnet
export const auraChainConfig: ChainInfo = {
  chainId: "xstaxy-1",
  chainName: "aura",
  //chainName: "Aura Xstaxy Mainnet",
  rpc: "https://rpc.aura.network",
  rest: "https://lcd.aura.network",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "aura",
    bech32PrefixAccPub: "aurapub",
    bech32PrefixValAddr: "auravaloper",
    bech32PrefixValPub: "auravaloperpub",
    bech32PrefixConsAddr: "auravalcons",
    bech32PrefixConsPub: "auravalconspub",
  },
  currencies: [
    {
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.001,
        average: 0.0025,
        high: 0.004,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "AURA",
    coinMinimalDenom: "uaura",
    coinDecimals: 6,
  },
  features: [],
};

// osmosis Mainnet
export const osmosisChainConfig: ChainInfo = {
  chainId: "osmosis-1",
  chainName: "osmosis",
  //chainName: "osmosis-1 Mainnet",
  rpc: "https://rpc.osmosis.zone",
  rest: "https://lcd.osmosis.zone",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "osmo",
    bech32PrefixAccPub: "osmopub",
    bech32PrefixValAddr: "osmovaloper",
    bech32PrefixValPub: "osmovaloperpub",
    bech32PrefixConsAddr: "osmovalcons",
    bech32PrefixConsPub: "osmovalconspub",
  },
  currencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.0025,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
  },
  features: [],
};

// Nois Mainnet
export const noisChainConfig: ChainInfo = {
  chainId: "nois-1",
  chainName: "Nois",
  rpc: "https://nois-mainnet-rpc.bccnodes.com/",
  rest: "https://nois-mainnet-api.bccnodes.com/",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "nois",
    bech32PrefixAccPub: "noispub",
    bech32PrefixValAddr: "noisvaloper",
    bech32PrefixValPub: "noisvaloperpub",
    bech32PrefixConsAddr: "noisvalcons",
    bech32PrefixConsPub: "noisvalconspub",
  },
  currencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NOIS",
    coinMinimalDenom: "unois",
    coinDecimals: 6,
  },
  features: [],
};
