import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod';
import { normalizeBech32 } from '@cosmjs/encoding';
import { Airdrop } from '@/lib/airdrop';
import { getBatchClient } from '../../hooks/cosmwasm';

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type validations
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const ChainType = z.enum(["uni", "juno", "stargaze", "injective", "aura"]);
export type ChainType = z.infer<typeof ChainType>;

const CheckParams = z.object({
  address: z.string(),
  chain: ChainType,
}).strict()
type CheckParams = z.infer<typeof CheckParams>;

const ParticipationStatus = z.enum(["ready", "not_eligible", "already_won", "already_lost", "waiting_randomness"]);
type ParticipationStatus = z.infer<typeof ParticipationStatus>;

export const CheckResponse = z.object({
  address: z.string(),
  chain: ChainType,
  userStatus: ParticipationStatus,
  amount: z.string(),
  proof: z.string().array(),
  submitted_at: z.string().optional(),
  claimed_at: z.string().optional(),
  amount_claimed: z.string().optional(),
  claim_contract: z.string().optional()
}).strict()
export type CheckResponse = z.infer<typeof CheckResponse>;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Route handler
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Validations
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Method
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }
    // Query Parmas
    const query = CheckParams.safeParse(req.query);
    if (query.success === false) {
      return res.status(400).json({
        error: "Failure Parsing Query Params"
      });
    }
    // Address
    if (validAddr(query.data.address) === false) {
      return res.status(400).json({
        error: "Invalid Address",
      });
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Check user eligibility
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Check if address is on Github Gist file
    const amtAndProof = await ifEligibleGetProof(query.data.address, query.data.chain);
    if (!amtAndProof) {
      // User not eligible
      return res.status(200).json({
        address: query.data.address,
        chain: query.data.chain,
        userStatus: "not_eligible",
        amount: "0",
        proof: []
      })
    }
    // Check user participation status
    const participationStatusRes = await checkParticipationStatus(query.data.address, query.data.chain);
    return res.status(200).json({
      address: query.data.address,
      chain: query.data.chain,
      userStatus: participationStatusRes.status,
      amount: amtAndProof.amount,
      proof: amtAndProof.proof,
      submitted_at: participationStatusRes.submitted_at,
      claimed_at: participationStatusRes.claimed_at,
      amount_claimed: participationStatusRes.amount_claimed,
      claim_contract: participationStatusRes.claim_contract
    });
    
  } catch(e) {
    console.error("Errmsg:", e);
    return res.status(400).json({
      error: `Invalid request: ${e}`
    });
  }
}

/** 
 * bech32 validate `addr`
 * - true if address is valid
 * - false if address is invalid
 */
const validAddr = (addr: string): boolean => {
  try {
    let x = normalizeBech32(addr);
    return true;
  } catch(e) {
    return false;
  }
}

const AirdropRegistry = {
  "uni": {
    "url": 'https://gist.githubusercontent.com/kaisbaccour/5a2f102ef476d533a3112b016aa45db4/raw/aa94b4d6682536ac518d1e98367b6bbc0eac5740/juno-randdrop.json',
    "contract": 'juno13qtdjhhltza8w2972fchk7fdkareadesat0907vfz6za7v84tznqr2uazr',
  },
  "juno": {
    "url": 'https://gist.githubusercontent.com/kaisbaccour/5a2f102ef476d533a3112b016aa45db4/raw/aa94b4d6682536ac518d1e98367b6bbc0eac5740/juno-randdrop.json',
    "contract": 'juno13qtdjhhltza8w2972fchk7fdkareadesat0907vfz6za7v84tznqr2uazr'
  },
  "injective": {
    "url": 'https://gist.githubusercontent.com/kaisbaccour/c26ede9d4219896bc03fb0fdfce310a3/raw/fa0825eb75607afad08ffb0fdead8567795150ad/injective-randdrop.json',
    "contract": 'juno13qtdjhhltza8w2972fchk7fdkareadesat0907vfz6za7v84tznqr2uazr'
  },
  "stargaze": {
    "url": 'https://gist.githubusercontent.com/kaisbaccour/ac8002e0329b4f54407e702c5dc4aa47/raw/1c8a75bdabf3dc04f77ed0d2c1cefedbba4fa060/stargaze-randdrop.json',
    "contract": 'juno13qtdjhhltza8w2972fchk7fdkareadesat0907vfz6za7v84tznqr2uazr'
  },
  "aura": {
    "url": 'https://gist.githubusercontent.com/kaisbaccour/edf03e2486d1f6a609e2d8918cfcb4a9/raw/99ce180cc8e082615d0c010e0192d3d829693c48/aura-randdrop.json',
    "contract": 'juno13qtdjhhltza8w2972fchk7fdkareadesat0907vfz6za7v84tznqr2uazr'
  }
}

interface AmtProof {
  amount: string,
  proof: string[]
}

/**
 * - Returns undefined if `addr` is not on Github list for `chain` 
 * - Returns Proof & amount (as string) if it is
 */
const ifEligibleGetProof = async (addr: string, chain: ChainType) => {
  // Chain Registry entry
  const entry = AirdropRegistry[chain];
  if (!entry) {
    throw new Error("Chain not in registry")
  }

  // Fetch list
  const randDropData = await fetch(entry.url);
  const chainData = await randDropData.json();

  // Find address
  const userDrop = chainData.find((obj) => obj.address === addr);

  if (!userDrop) {
    console.log(`${addr} not eligible for ${chain} | Gist lookup not found`)
    return undefined;
  } else {
    // Address found, generate proof & return it
    const airdrop = new Airdrop(chainData);
    const userEligibleAmt = String(userDrop.amount);
    const proof = airdrop.getMerkleProof({
      address: addr,
      amount: userEligibleAmt
    });
    return {
      amount: userEligibleAmt,
      proof
    } as AmtProof
  }
}

type ParRes = {
  status: ParticipationStatus,
  submitted_at?: string | null | undefined,
  claimed_at?: string | null | undefined,
  amount_claimed?: string,
  claim_contract?: string
}

/**
 * - Checks `addr` participation status & if waiting on randomness
 */
const checkParticipationStatus = async (addr: string, chain: ChainType): Promise<ParRes> => {

  // Chain Registry entry
  const entry = AirdropRegistry[chain];
  if (!entry) {
    throw new Error("Chain not in registry")
  }

  const batchClient = await getBatchClient(chain);

  const res = await batchClient.wasm.queryContractSmart(
    entry.contract,
    {
      participant: {
        address: addr
      }
    }
  );

  if (!res) {
    throw new Error("Error querying Randdrop contract")
  };
  
  // This function is only called if address was in Github gist file,
  // So if res is undefined it means that user is eligible but hasn't participated yet
  // Participated means Submit to Randdrop contract to "roll the dice"
  if (!res.participant || res.participant === null) {
    return {
      status: "ready" as ParticipationStatus,
      claim_contract: entry.contract
    }
  };

  // If user hasn't claimed && randomness is none, then must be waiting on randomness
  if (res.participant.has_claimed === false && !res.participant.nois_randomness) {
    return {
      status: "waiting_randomness" as ParticipationStatus,
      submitted_at: res.participant.participate_time
    }
  };

  if (res.participant.is_winner === true) {
    return {
      status: "already_won" as ParticipationStatus,
      submitted_at: res.participant.participate_time,
      claimed_at: res.participant.claim_time,
      amount_claimed: res.participant.amount_claimed
    }
  };

  // If randomness is some && amount_claimed is 0, user didn't win
  if (!!res.participant.nois_randomness && res.participant.is_winner === false) {
    return {
      status: "already_lost" as ParticipationStatus,
      submitted_at: res.participant.participate_time,
      claimed_at: res.participant.claim_time
    }
  };

  throw new Error("Unknown combination")
}