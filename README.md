# Nois Randdrop Frontend

A simple UI to check if a wallet is eligible for the Nois Randdrop, and claim when available

</br>

# Configuration

## `./pages/index.tsx`
**When testnet airdrop is over**

Remove this
```ts
className={`${(currentChain !== "juno"...
```

Update Timer Value(s?)
```ts
// Set to time claiming window opens, in milliseconds
const ClaimWindowOpenTime: number = 1_685_500_001_000
```

## `./contexts/chainSelect.tsx`

Edit for any new chain & update all instances throughout codebase. Typescript linter will alert you once you add or remove something
```ts
export type availableChain = "juno" | "injective" | "stargaze" | "aura";
```

## `./services/chainConfig.ts`

Add applicable `ChainInfo` from [Keplr Chain Registry](https://github.com/chainapsis/keplr-chain-registry) for any new Chains

## `./components/chainSelector.tsx`

Update button values with any new Chains

## `./util/msg.ts`

Replace with applicable Randdrop contract addresses 
```ts
const UniAirdropAddr = "";
const JunoAirdropAddr = "";
const InjectiveAirdropAddr = "";
const StargazeAirdropAddr = "";
const AuraAirdropAddr = "";
```

## `./util/addressConversion`

Update with any new chains and modify functions
```ts
interface AddressTable {
  injective: string,
  juno: string,
  stargaze: string,
  aura: string,
  nois: string
}
```