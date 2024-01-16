import { z } from 'zod';

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type validations
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const ChainType = z.enum([ "juno", "stargaze", "injective", "aura", "osmosis"]);
export type ChainType = z.infer<typeof ChainType>;

export const CheckParams = z.object({
  address: z.string(),
  chain: ChainType,
}).strict()
export type CheckParams = z.infer<typeof CheckParams>;

export const ParticipationStatus = z.enum(["ready", "not_eligible", "already_won", "already_lost", "waiting_randomness"]);
export type ParticipationStatus = z.infer<typeof ParticipationStatus>;

export const CheckResponse = z.object({
  address: z.string(),
  chain: ChainType,
  userStatus: ParticipationStatus,
  amount: z.string(),
  proof: z.string().array(),
  submitted_at: z.string().optional(),
  claimed_at: z.string().optional(),
  winning_amount: z.string().optional(),
  claim_contract: z.string().optional()
}).strict()
export type CheckResponse = z.infer<typeof CheckResponse>;



export const AirdropRegistry = {
  "juno": {
    "contract": 'juno1pqcxmuc4nhkjqgymwraxzqj25yljdlnmu7rd675c6ypg9dakcwlszvk9gk'
  },
  "injective": {
    "url": 'https://raw.githubusercontent.com/noislabs/randdrop-snapshots/v0.3.0/injective-randdrop-2.json',
    //"url": 'https://gist.githubusercontent.com/kaisbaccour/c26ede9d4219896bc03fb0fdfce310a3/raw/fa0825eb75607afad08ffb0fdead8567795150ad/injective-randdrop.json',
     "contract": 'inj1z4nmwyaujc89tqwfhd6wm6hugdr3f4jnllxfgk'
    // for testing
    //"url": 'https://gist.githubusercontent.com/hoangdv2429/f4569307b2191e5a40d468019297a35f/raw/bb5560436bb2f747393503fdc9a25c8327166d4e/injective-randdrop.json',
    //"contract": 'inj1hjl70antdrqlhunaesp8d6lv4nuy9rknfpn48w'
  },
  "stargaze": {
    "url": 'https://raw.githubusercontent.com/noislabs/randdrop-snapshots/v0.2.1/stargaze-randdrop-2.json',
    "contract": 'stars1qytke02t6mrj6zvyjymrd4e6h3l78ecx2nwwf9huvcprehy7xmsqpqh7za'
  },
  "aura": {
    //"url": 'https://gist.githubusercontent.com/kaisbaccour/05b6dda6672a6b9c7beaf6198006a4c2/raw/11cbf1f49dba15bfd07f61ea4430392f556441d0/gistfile1.json',
    "url": 'https://raw.githubusercontent.com/noislabs/randdrop-snapshots/v0.2.1/aura-randdrop-2.json',
    "contract": 'aura1femc3zxv4c43rwpy43na9gul4ssr8dkxe3m9v8afzlmhgj69sw6ql28x39'
  },
  "osmosis": {
    "url": 'https://raw.githubusercontent.com/noislabs/randdrop-snapshots/v0.2.1/osmosis-randdrop-1.json',
    "contract": 'osmo1873ls0d60tg7hk00976teq9ywhzv45u3hk2urw8t3eau9eusa4eqtun9xn'
  }
}

export const getContractAddress = (chainType: string) => {
  const chain = AirdropRegistry[chainType]
  if (!chain) {
    return ""
  }

  return chain.contract
}

type ParRes = {
  status: ParticipationStatus,
  submitted_at?: string | null | undefined,
  claimed_at?: string | null | undefined,
  winning_amount?: string,
  claim_contract?: string
}


