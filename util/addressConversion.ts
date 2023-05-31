import { toBech32, fromBech32, normalizeBech32 } from '@cosmjs/encoding';
import { toast } from 'react-hot-toast';

interface AddressTable {
  injective: string,
  juno: string,
  stargaze: string,
  aura: string,
  nois: string
}

/**
 * Takes in any arbitrary string
 * - If valid Cosmos Bech32 address, returns `AddressTable` with each chain's address
 * - If invalid, returns `AddressTable` with empty strings 
 */
export function getAddressTable(address: string): AddressTable {
  try {
    const { data } = fromBech32(address);
    const injective = toBech32("inj", data);
    const juno = toBech32("juno", data);
    const stargaze = toBech32("stars", data);
    const aura = toBech32("aura", data);
    const nois = toBech32("nois", data);
    return {
      injective,
      juno,
      stargaze,
      aura,
      nois
    }
  } catch (e) {
    return {
      injective: "",
      juno: "",
      stargaze: "",
      aura: "",
      nois: ""
    }
  }
}

/** Returns address if valid Bech32, undefined if invalid */
export function validateAddress(address: string): string | undefined {
  try {
    const valid = normalizeBech32(address);
    return valid;
  } catch (e) {
    return undefined;
  }
}

/** Divide by 1_000_000 */
export function fromMicro(amount: number | string) {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount / 1_000_000;
  return isNaN(amount) ? 0 : amount;
}