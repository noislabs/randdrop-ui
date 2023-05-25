import { toBech32, fromBech32, normalizeBech32 } from '@cosmjs/encoding';
import { toast } from 'react-hot-toast';

const injectivePrefix = "inj";
const junoPrefix = "juno";
const stargazePrefix = "stars";
const auraPrefix = "aura";


interface AddressTable {
  injective: string,
  juno: string,
  stargaze: string,
  aura: string
}

export function getAddressTable(address: string): AddressTable {
  try {
    const { data } = fromBech32(address);
    const injective = toBech32(injectivePrefix, data);
    const juno = toBech32(junoPrefix, data);
    const stargaze = toBech32(stargazePrefix, data);
    const aura = toBech32(auraPrefix, data);
    return {
      injective,
      juno,
      stargaze,
      aura
    }
  } catch (e) {
    toast.error("ERROR: Invalid Address Format");
    return {
      injective: "",
      juno: "",
      stargaze: "",
      aura: ""
    }
  }
}

export function validateAddresses(injA: string, junoA: string, starsA: string, auraA: string): AddressTable | undefined {
  try {
    const injective = normalizeBech32(injA);
    const juno = normalizeBech32(junoA);
    const stargaze = normalizeBech32(starsA);
    const aura = normalizeBech32(auraA);
    return {
      injective,
      juno,
      stargaze,
      aura
    };
  } catch (e) {
    toast.error("ERROR: Invalid Address Format!");
    return undefined;
  }
}

export function fromMicro(amount: number | string) {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount / 1_000_000;
  return isNaN(amount) ? 0 : amount;
}