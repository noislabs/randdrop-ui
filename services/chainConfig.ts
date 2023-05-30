import { Keplr, ChainInfo } from "@keplr-wallet/types";
import { availableChain } from "../contexts/chainSelect";

export const noisChainConfig: ChainInfo = {
  chainId: "nois-testnet-005",
  chainName: "Nois Testnet",
  rpc: "https://nois-testnet-rpc.polkachu.com/",
  rest: "https://nois-004.api.bccnodes.com",
  // chainId: "nois-1",
  // chainName: "Nois",
  // rpc: "https://nois-mainnet-rpc.bccnodes.com/",
  // rest: "https://nois-mainnet-api.bccnodes.com/",
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
      coinGeckoId: "unknown",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NOIS",
      coinMinimalDenom: "unois",
      coinDecimals: 6,
      coinGeckoId: "unknown",
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
    coinGeckoId: "unknown",
  },
  features: [],
};

/** Testnet */
export const junoChainConfig: ChainInfo = {
  chainId: "uni-6",
  chainName: "Juno Testnet",
  rpc: "https://juno-testnet-rpc.polkachu.com/",
  rest: "https://juno-testnet-rpc.polkachu.com:443",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "juno",
    bech32PrefixAccPub: "junopub",
    bech32PrefixValAddr: "junovaloper",
    bech32PrefixValPub: "junovaloperpub",
    bech32PrefixConsAddr: "junovalcons",
    bech32PrefixConsPub: "junovalconspub"
  },
  currencies: [
    {
      coinDenom: "JUNOX",
      coinMinimalDenom: "ujunox",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "JUNOX",
      coinMinimalDenom: "ujunox",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "JUNOX",
    coinMinimalDenom: "ujunox",
    coinDecimals: 6,
  },
  features: []
};

/** Mainnet */
// export const junoChainConfig: ChainInfo = {
//   chainId: "juno-1",
//   chainName: "Juno Mainnet",
//   rpc: "https://juno-rpc.polkachu.com/",
//   rest: "https://juno-api.polkachu.com:443",
//   bip44: {
//     coinType: 118,
//   },
//   bech32Config: {
//     bech32PrefixAccAddr: "juno",
//     bech32PrefixAccPub: "junopub",
//     bech32PrefixValAddr: "junovaloper",
//     bech32PrefixValPub: "junovaloperpub",
//     bech32PrefixConsAddr: "junovalcons",
//     bech32PrefixConsPub: "junovalconspub"
//   },
//   currencies: [
//     {
//       coinDenom: "JUNO",
//       coinMinimalDenom: "ujuno",
//       coinDecimals: 6,
//     },
//   ],
//   feeCurrencies: [
//     {
//       coinDenom: "JUNO",
//       coinMinimalDenom: "ujuno",
//       coinDecimals: 6,
//       gasPriceStep: {
//         low: 0.05,
//         average: 0.05,
//         high: 0.1,
//       },
//     },
//   ],
//   stakeCurrency: {
//     coinDenom: "JUNO",
//     coinMinimalDenom: "ujuno",
//     coinDecimals: 6,
//   },
//   features: []
// };

export const stargazeChainConfig: ChainInfo = {
  chainId: "stargaze-1",
  chainName: "stargaze",
  rpc: "https://stargaze-rpc.polkachu.com",
  rest: "https://stargaze-api.polkachu.com",
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
      //coinGeckoId: "unknown",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "STARS",
      coinMinimalDenom: "ustars",
      coinDecimals: 6,
      //coinGeckoId: "unknown",
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
    //coinGeckoId: "unknown",
  },
  features: [],
};

export const injectiveChainConfig: ChainInfo = {
  chainId: "injective-1",
  chainName: "injective",
  rpc: "https://injective-rpc.polkachu.com",
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
      //coinGeckoId: "unknown",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "INJ",
      coinMinimalDenom: "uinj",
      coinDecimals: 6,
      //coinGeckoId: "unknown",
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
    //coinGeckoId: "unknown",
  },
  features: [],
};

export const auraChainConfig: ChainInfo = {
  chainId: "xstaxy-1",
  chainName: "aura",
  rpc: "https://aura-rpc.lavenderfive.com",
  rest: "https://aura-api.lavenderfive.com",
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
      //coinGeckoId: "unknown",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      //coinGeckoId: "unknown",
      gasPriceStep: {
        low: 0.05,
        average: 0.05,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "AURA",
    coinMinimalDenom: "uaura",
    coinDecimals: 6,
    //coinGeckoId: "unknown",
  },
  features: [],
};


export const getChainConfig = (chain: availableChain) => {
  switch (chain) {
    case "juno": {
      return junoChainConfig;
    }
    case "stargaze": {
      return stargazeChainConfig;
    }
    case "injective": {
      return injectiveChainConfig;
    }
    // case "aura": {
    //   return auraChainConfig;
    // }
  }
}
