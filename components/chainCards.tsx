import { useMemo, useCallback } from 'react'
import { toast } from 'react-hot-toast';
import { ChainSigningClient } from '../hooks/cosmwasm';
import NextImage from "next/image";
import StargazeLogo from "../public/BIGstars.png";
import InjectiveLogo from "../public/INJECTIVE400x400.jpg";
import JunoLogo from "../public/JUNO400x400.png";
import AuraLogo from "../public/AURA400x400.jpg";
import DiceLoader from '../components/diceLoader';
import { ChainType, CheckResponse } from '../pages/api/check';
import { parseTimestamp } from '../services/parsing'
import { randdropClaimMsg } from '../services/contractTx'

export const ChainCard = ({
  chain,
  chainStatus,
  client,
  checkResponse,
  walletLoading
}:{
  chain: ChainType;
  chainStatus: string;
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse | undefined;
  walletLoading: boolean;
}) => {

  const logo = useMemo(() => {
    switch (chain) {
      case "injective":
        return InjectiveLogo;
      case "aura":
        return AuraLogo;
      case "stargaze":
        return StargazeLogo;
      default:
        return JunoLogo;
    }
  }, [chain]);

  // Ring color | Status text
  const {
    logoClassName, 
    titleClassName,
    title
  } = useMemo(() => {
    switch (checkResponse?.userStatus) {
      // User can claim randdrop
      case "ready": {
        return {
          logoClassName: "ring-4 ring-green-500 ring-offset-4 ring-offset-nois-blue grayscale-75brightness-75",
          titleClassName: "text-green-500 text-sm",
          title: "Ready to test your luck?"
        }
      }
      // User not eligible for randdrop
      case "not_eligible": {
        return {
          logoClassName: "ring-4 ring-gray-700 ring-offset-4 ring-offset-nois-blue grayscale-50 brightness-50",
          titleClassName: "text-gray-500 text-sm",
          title: "Not eligible"
        }
      }
      // User has submitted & waiting for randomness callback
      case "waiting_randomness": {
        return {
          logoClassName: "ring-4 ring-amber-300 ring-offset-4 ring-offset-nois-blue",
          titleClassName: "text-amber-300 text-sm",
          title: "Dice rolled, waiting for outcome..."
        }
      }
      // User already won & NOIS tokens were sent by proxy
      case "already_won": {
        return {
          logoClassName: "ring-4 ring-cyan-500 ring-offset-4 ring-offset-nois-blue grayscale-50 brightness-50",
          titleClassName: "text-cyan-500 text-sm brightness-75",
          title: "You won! Check your wallet!"
        }
      }
      // User already submitted & lost
      case "already_lost": {
        return {
          logoClassName: "ring-4 ring-rose-800 ring-offset-4 ring-offset-nois-blue grayscale-50 brightness-50",
          titleClassName: "text-rose-800 text-sm",
          title: "Did not win"
        }
      }
      // Undefined, means still waiting for API response
      default: {
        return {
          logoClassName: "",
          titleClassName: "invisible",
          title: ""
        }
      }
    }
  }, [checkResponse?.userStatus])


  return (
    <div className="row-span-1 lg:col-span-1 lg:row-span-4 flex flex-col">
      {/* Image */}
      <div className="h-[40%] flex justify-center p-1">
        <div className="relative aspect-square ">
          <NextImage
            src={logo}
            alt={`${chain}_logo`}
            unoptimized
            object-fit="cover"
            fill={true}
            className={`rounded-full ${logoClassName}`}
          />
        </div>

      </div>
      {/* Wallet Address */}
      <div className="h-[8%] w-full block text-center items-center text-nois-white/50 text-sm font-mono overflow-hidden text-ellipsis py-2 px-8">
        {!client && walletLoading ? (
          <span className="animate-pulse text-nois-white/40 text-base">{"Connecting..."}</span>
        ):(
          <>
            {client?.walletAddress ?? "Not connected"}
          </>
        )}
      </div>
      {/* User Status bar */}
      <div className={`h-[8%] ${titleClassName} w-full block text-center items-center overflow-hidden text-ellipsis px-8`}>
        {!client ? (
          <span className="animate-pulse text-nois-white/40 text-lg tracking-widest">{"..."}</span>
        ):(
          <span>{title}</span>
        )}
      </div>
      {/* Dice Loader */}
      <div className="h-[44%] flex justify-center items-center ">
        {!checkResponse || !client ? (
          <div className="w-full h-full flex justify-center items-center pb-10">
            <DiceLoader chain={chain} />
          </div>
        ):(
          <ClaimInfo client={client} checkResponse={checkResponse}/>
        )}
      </div>
    </div>
  )
}

export const ClaimInfo = ({
  client,
  checkResponse
}:{
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse;
}) => {

  const {
    submitted,
    claimed,
    winning_amount
  } = useMemo(() => {
    const submitted = checkResponse.submitted_at ? parseTimestamp(checkResponse.submitted_at) : "";
    const claimed = checkResponse.claimed_at ? parseTimestamp(checkResponse.claimed_at) : "";
    const winning_amount = checkResponse.winning_amount ? 
      `${checkResponse.winning_amount.slice(0, -6) + '.' + checkResponse.winning_amount.slice(-6, -3)}` : "";
    return {
      submitted,
      claimed,
      winning_amount
    }
  }, [])

  const handleClaimRanddrop = useCallback(() => {
    if (client) {
      let msg = randdropClaimMsg({
        wallet: client.walletAddress,
        contract: checkResponse.claim_contract ?? "x",
        amount: checkResponse.amount,
        proof: checkResponse.proof
      });
      client.signingClient.signAndBroadcast(
        client.walletAddress, 
        [msg], 
        "auto"
      ).then((r) => {
        toast.success(`Dice are rolling!`);
        toast.success(`Check back in a few minutes to view your result`);
      }).catch((e) => {
        console.log(e);
        toast.error(`Problem submitting transaction`)
        toast.error(`Visit our Discord for assistance`);
      })
    }

  }, [client?.walletAddress])

  if (!client || checkResponse.userStatus === "not_eligible") {
    return <></>
  } else {
    switch (checkResponse.userStatus) {
      case "ready": {
        return (
          <div className={`w-full h-full p-6 flex justify-center items-start`}>
            <button
              onClick={() => handleClaimRanddrop()} 
              className={`py-2 px-6 animate-pulse hover:animate-none hover:shaxdow-neon-md hover:bg-green-500/10 text-green-500 border border-green-500 rounded-xl bg-gradient-to-b from-green-500/10`}
            >
              {"Roll the dice!"}
            </button>
          </div>
        )
      }
      case "already_won": {
        return (
          <div className={`w-full h-full p-4 flex flex-col justify-start gap-y-2 items-center`}>
            <div className="text-nois-white/80 text-sm">
              {`Submitted at: ${submitted}`}
            </div>
            <div className="text-nois-white/80 text-sm">
              {`Finalized at: ${claimed}`}
            </div>
            <div className="text-nois-white text-lg">
              {`Amount: ${winning_amount}`}
            </div>
          </div>
        )
      }
      case "already_lost": {
        return (
          <div className={`w-full h-full p-4 flex flex-col justify-start gap-y-2 items-center`}>
            <div className="text-nois-white/80 text-sm">
              {`Submitted at: ${submitted}`}
            </div>
            <div className="text-nois-white/80 text-sm">
              {`Finalized at: ${claimed}`}
            </div>
          </div>
        )
      }
      case "waiting_randomness": {
        return (
          <div className="w-full h-full flex flex-col justify-start gap-y-9 items-center">
            <div className="text-nois-white/80 text-sm">
              {`Submitted at: ${submitted}`}
            </div>
            <DiceLoader chain={checkResponse.chain} />
          </div>
        )
      }
      default: {
        return (
          <></>
        )
      }
    }
  }
}

const mockChainRes = {
  address: "slfjslafjaslkdfjs",
  chain: "stargaze",
  //userStatus: "already_won",
  //userStatus: "already_lost",
  userStatus: "waiting_randomness",
  amount: "235322352",
  proof: ["fj", "slfj"],
  submitted_at: parseTimestamp("1689561497121000000"),
  claimed_at: parseTimestamp("1689561503121000000"),
  winning_amount: `${"234323523523523".slice(0, -6) + '.' + "234323523523523".slice(-6)}`
} as CheckResponse;