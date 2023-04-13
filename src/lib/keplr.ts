// type not needed because fields are deprecated
type AxiosRequestConfig = never;

// See https://github.com/chainapsis/keplr-wallet/blob/master/packages/types/src/currency.ts
interface Currency {
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}

// We don't need those
type CW20Currency = never;
type Secret20Currency = never;
type IBCCurrency = never;
type ERC20Currency = never;

export type WithGasPriceStep<T> = T & {
  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   */
  readonly gasPriceStep?: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
};

export type FeeCurrency = WithGasPriceStep<AppCurrency>;

/**
 * Any type of currency that Kepler applications can support.
 */
export type AppCurrency = Currency | CW20Currency | Secret20Currency | IBCCurrency | ERC20Currency;

export interface BIP44 {
  readonly coinType: number;
}

// See https://github.com/chainapsis/keplr-wallet/blob/master/packages/types/src/bech32.ts
export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

// See https://github.com/chainapsis/keplr-wallet/blob/master/packages/types/src/chain-info.ts
// and https://docs.keplr.app/api/suggest-chain.html
export interface ChainInfo {
  readonly rpc: string;
  /**
   * @deprecated Do not use
   */
  readonly rpcConfig?: AxiosRequestConfig;
  readonly rest: string;
  /**
   * @deprecated Do not use
   */
  readonly restConfig?: AxiosRequestConfig;
  readonly nodeProvider?: {
    readonly name: string;
    readonly email: string;
    readonly website?: string;
  };
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency: Currency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;

  readonly currencies: AppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: FeeCurrency[];
  /**
   * This is the coin type in slip-044.
   * This is used for fetching address from ENS if this field is set.
   *
   * ** Use the `bip44.coinType` field to set the coin type to generate the address. **
   *
   * @deprecated This field is likely to be changed. ENS will continue to be supported, but will change in the future to use other methods than this field. Because of the low usage of the ENS feature, the change is a low priority and it is not yet clear how it will change.
   */
  readonly coinType?: number;

  /**
   * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
   */
  readonly features?: string[];

  /**
   * Shows whether the blockchain is in production phase or beta phase.
   * Major features such as staking and sending are supported on staging blockchains, but without guarantee.
   * If the blockchain is in an early stage, please set it as beta.
   */
  readonly beta?: boolean;

  /**
   * If the chain is EVM-enabled, set an Ethereum JSON-RPC endpoint here, to be used for ERC-20 token balances.
   */
  readonly ethereumJsonRpc?: string;

  readonly chainSymbolImageUrl?: string;
}
