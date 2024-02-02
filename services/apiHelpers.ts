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
    "contract": 'juno1qgyxtc6tkxj3zzzkdcq7anq0p3nfwvvjan8w8xaszwv0yrqkcmmsj0nkun'
  },
  "injective": {
     "contract": 'inj1z4nmwyaujc89tqwfhd6wm6hugdr3f4jnllxfgk'
    //"contract": 'inj1hjl70antdrqlhunaesp8d6lv4nuy9rknfpn48w'
  },
  "stargaze": {
    "contract": 'stars1qytke02t6mrj6zvyjymrd4e6h3l78ecx2nwwf9huvcprehy7xmsqpqh7za'
  },
  "aura": {
    "contract": 'aura1femc3zxv4c43rwpy43na9gul4ssr8dkxe3m9v8afzlmhgj69sw6ql28x39'
  },
  "osmosis": {
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


