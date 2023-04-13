import { ChainInfo } from "./keplr";

export const addressPrefix = "nois";

export const noisTestnet: ChainInfo = {
  chainId: "nois-testnet-004",
  chainName: "Nois Testnet",
  rpc: "https://nois-004.rpc.bccnodes.com",
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

export const noisMainnet: ChainInfo = {
  ...noisTestnet,
  chainId: "nois-1",
  chainName: "Nois",
  rpc: "https://nois-mainnet-rpc.bccnodes.com/",
  rest: "https://nois-mainnet-api.bccnodes.com/",
};
