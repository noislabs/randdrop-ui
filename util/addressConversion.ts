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

// export function validateAddresses(injA: string, junoA: string, starsA: string, auraA: string): AddressTable | undefined {
//   try {
//     const injective = normalizeBech32(injA);
//     const juno = normalizeBech32(junoA);
//     const stargaze = normalizeBech32(starsA);
//     const aura = normalizeBech32(auraA);
//     const nois = normalizeBech32()
//     return {
//       injective,
//       juno,
//       stargaze,
//       aura
//     };
//   } catch (e) {
//     toast.error("ERROR: Invalid Address Format!");
//     return undefined;
//   }
// }


/** Divide by 1_000_000 */
export function fromMicro(amount: number | string) {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount / 1_000_000;
  return isNaN(amount) ? 0 : amount;
}

// export function validateAddressestwo(
//   //injA: string, 
//   junoA: string, 
//   // starsA: string, 
//   // auraA: string
// ): string | undefined {
//   try {
//     const juno = normalizeBech32(junoA);
//     return juno;
//   } catch (e) {
//     return undefined;
//   }
// }
