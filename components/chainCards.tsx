import { useMemo, useCallback, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';
import { ChainSigningClient } from '../contexts/userClients';
import NextImage from "next/image";
import StargazeLogo from "../public/BIGstars.png";
import InjectiveLogo from "../public/INJECTIVE400x400.jpg";
import JunoLogo from "../public/JUNO400x400.png";
import AuraLogo from "../public/AURA400x400.jpg";
import OsmosisLogo from "../public/OSMOSIS400x400.png";
import DiceLoader from '../components/diceLoader';
import Progress from './progressBar';
import { ChainType, CheckResponse } from '../pages/api/check';
import { parseTimestamp } from '../services/parsing'
import { randdropClaimMsg } from '../services/contractTx'
import { ethLedgerTxHelper } from '../services/ledgerHelpers';
import { routeNewTab } from '../services/misc';
import { AirdropLiveStatus } from '../pages';
import { signSendAndBroadcastOnInjective } from '../services/injective';
import { calculatePercentage } from '../hooks/cosmwasm';
import { getContractAddress } from '../pages/api/check';
import { Popover, Spin } from 'antd';

const BridgeLinks = {
  "injective": "https://tfm.com/bridge?chainTo=nois-1&chainFrom=injective-1&token0=ibc%2FDD9182E8E2B13C89D6B4707C7B43E8DB6193F9FF486AFA0E6CF86B427B0D231A&token1=unois",
  "juno": "https://tfm.com/bridge?chainTo=nois-1&chainFrom=juno-1&token0=ibc%2F1D9E14A1F00613ED39E4B8A8763A20C9BE5B5EA0198F2FE47EAE43CD91A0137B&token1=unois",
  "stargaze": "https://tfm.com/bridge?chainTo=nois-1&chainFrom=stargaze-1&token0=ibc%2F0F181D9F5BB18A8496153C1666E934169515592C135E8E9FCCC355889858EAF9&token1=unois",
  "aura": "https://tfm.com/bridge?chainTo=nois-1&chainFrom=xstaxy-1&token0=ibc%2F1FD48481DAA1B05575FE6D3E35929264437B8424A73243B207BCB67401C7F1FD&token1=unois",
  "osmosis": "https://tfm.com/bridge?chainTo=nois-1&chainFrom=osmosis-1&token0=ibc%2F6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90&token1=unois"
}

export const ChainCard = (props: {
  chain: ChainType;
  chainStatus: string;
  refetch: () => {};
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse | undefined;
  walletLoading: boolean;
}) => {

  if (AirdropLiveStatus[props.chain] === true) {
    return <LiveChainCard {...props} />
  } else {
    return <PausedChainCard {...props} />
  }
}

export const PausedChainCard = ({
  chain,
  chainStatus,
  refetch,
  client,
  checkResponse,
  walletLoading
}: {
  chain: ChainType;
  chainStatus: string;
  refetch: () => {};
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
      case "osmosis":
        return OsmosisLogo;
      case "stargaze":
        return StargazeLogo;
      default:
        return JunoLogo;
    }
  }, [chain]);

  return (
    <div className="row-span-1 lg:col-span-1 lg:row-span-4 flex flex-col gap-y-4 md:gap-y-0 text-gray-500">
      {/* Image */}
      <div className="h-[40%] flex justify-center p-0 md:p-1">
        <div className="relative aspect-square ">
          <NextImage
            src={logo}
            alt={`${chain}_logo`}
            unoptimized
            object-fit="cover"
            fill={true}
            className={`rounded-full grayscale-50 brightness-[.25]`}
          />
        </div>
      </div>
      {/* Wallet Address */}
      <div className="hidden h-[8%] w-full md:block text-center items-center text-sm font-mono md:overflow-hidden text-ellipsis py-2 md:px-8">
        {!client && walletLoading ? (
          <span className="animate-pulse text-base">{"Connecting..."}</span>
        ) : (
          <>
            {client?.walletAddress ?? "Not connected"}
          </>
        )}
      </div>
      {/* User Status bar */}
      <div className={`h-[8%] text-sm w-full block text-center items-center md:overflow-hidden text-ellipsis md:px-8`}>
        <span>Randdrop not yet live</span>
      </div>
      {/* Claim Info*/}
      <div className="hidden h-[44%] md:flex justify-center items-center ">
        <div className="w-full h-full flex flex-col justify-start items-center gap-y-4 pb-10 text-sm">
          Coming soon...
        </div>
      </div>
    </div>
  )
}


export const LiveChainCard = ({
  chain,
  chainStatus,
  refetch,
  client,
  checkResponse,
  walletLoading
}: {
  chain: ChainType;
  chainStatus: string;
  refetch: () => {};
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
      case "osmosis":
        return OsmosisLogo;
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
    <div className="row-span-1 lg:col-span-1 lg:row-span-4 flex flex-col gap-y-4 md:gap-y-0">
      {/* Image */}
      <div className="h-[40%] flex justify-center p-0 md:p-1">
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
      <div className="h-[8%] w-full block text-center items-center text-nois-white/50 text-sm font-mono md:overflow-hidden text-ellipsis py-2 md:px-8">
        {!client && walletLoading ? (
          <span className="animate-pulse text-nois-white/40 text-base">{"Connecting..."}</span>
        ) : (
          <>
            {client?.walletAddress ?? "Not connected"}
          </>
        )}
      </div>
      {/* User Status bar */}
      <div className={`h-[8%] ${titleClassName} w-full block text-center items-center md:overflow-hidden text-ellipsis md:px-8`}>
        {!client ? (
          <span className="animate-pulse text-nois-white/40 text-lg tracking-widest">{"..."}</span>
        ) : (
          <span>{title}</span>
        )}
      </div>
      {/* Claim Info*/}
      <div className="flex justify-center items-center ">
        {!checkResponse || !client ? (
          <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 pb-10">
            <div className="circle-spinner" />
            <span className="text-sm text-nois-light-green/50">
              {"Checking eligibility..."}
            </span>
          </div>
        ) : (
          <ClaimInfo client={client} checkResponse={checkResponse} refetch={refetch} />
        )}
      </div>
    </div>
  )
}

const ProgressBar = ({ tokenLeft, claimPercentageLeft }) => (
  <div style={{ width: '75%' }}>
    <Popover placement="top" content={`${(tokenLeft / Math.pow(10, 6)).toFixed(2)} Nois left`}>
      <div>
        <Progress percentageLeft={claimPercentageLeft} />
      </div>
    </Popover>
    {
      (tokenLeft < 20_000_000 || claimPercentageLeft === 0) && (
        <div style={{ color: 'white', display: 'flex', justifyContent: 'center' }}>
          All tokens claimed
        </div>
      )
    }
  </div>
);

export const ClaimInfo = ({
  client,
  checkResponse,
  refetch
}: {
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse;
  refetch: () => {}
}) => {
  const [claimPercentageLeft, setClaimPercentageLeft] = useState(0)
  const [tokenLeft, setTokenLeft] = useState(0)

  useEffect(() => {
    (async () => {
      // If no client, or client is not metamask or ledger, return
      if (!client || !client.chain) {
        toast.error(`Wallet or Ledger not connected for ${checkResponse.chain}`);
        return;
      }

      const contractAddress = getContractAddress(client.chain)

      if (contractAddress === "") {
        toast.error(`No randdrop contract available for ${checkResponse.chain}`);
        return;
      }

      const resp = await calculatePercentage(client?.chain, contractAddress)
      if (!resp) {
        toast.error(`Unable to fetch contract balance for ${checkResponse.chain}`);
        return;
      }
      console.log(resp)
      setClaimPercentageLeft(parseFloat(resp.percentageLeft.toFixed(2)))
      setTokenLeft(resp.amountLeft)
    })()
  }, [])

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
  }, [checkResponse?.userStatus])

  const handleClaimRanddrop = useCallback(() => {

    // If no client, or client is not metamask or ledger, return
    if (!client || (client.walletType !== "metamask" && !client.ethLedgerClient && !client.signingClient)) {
      toast.error(`Wallet or Ledger not connected for ${checkResponse.chain}`);
      return;
    }

    // Assert claim_contract exists
    if (!checkResponse.claim_contract) {
      toast.error(`No randdrop contract available for ${checkResponse.chain}`);
      return;
    }

    // If walletType is ledger && chain is injective, use helper
    if (client.walletType === "metamask" && client.chain === "injective") {
      toast.loading("Processing your request...");
      signSendAndBroadcastOnInjective({
        client,
        wallet: client.walletType,
        message: {
          wallet: client.walletAddress,
          contract: checkResponse.claim_contract ?? "x",
          amount: checkResponse.amount,
          proof: checkResponse.proof
        },
      }).then((r) => {
        toast.dismiss();
        refetch();
        toast.success(`Dice are rolling!`);
        toast.success(`Check back in a few seconds to view your result`);
      }).catch((e) => {
        toast.dismiss();
        console.log(e);
        toast.error(`Problem submitting transaction`)
        toast.error(`Visit our Discord for assistance`);
      });
    } else if (client.walletType === "ledger" && client.chain === "injective") {
      toast.loading("Processing your request...");
      ethLedgerTxHelper({
        client,
        checkResponse
      }).then((txhash) => {
        toast.dismiss();
        refetch();
        console.log(`Transaction broadcasted | TxHash: ${txhash}`);
        toast.success(`Transaction broadcasted | TxHash: ${txhash}`);
      }).catch((e) => {
        toast.dismiss();
        console.log(`Error: ${e}`);
        toast.error("Failure broadcasting transaction");
        toast.error(`Error: ${e}`);
      });
    } else if (client.chain === "injective") { // walletType === "keplr" || walletType === "leap"
      toast.loading("Processing your request...");
      signSendAndBroadcastOnInjective({
        client,
        wallet: client.walletType,
        message: {
          wallet: client.walletAddress,
          contract: checkResponse.claim_contract ?? "x",
          amount: checkResponse.amount,
          proof: checkResponse.proof
        },
      }).then((r) => {
        toast.dismiss();
        refetch();
        toast.success(`Dice are rolling!`);
        toast.success(`Check back in a few seconds to view your result`);
      }).catch((e) => {
        toast.dismiss();
        console.log(e);
        toast.error(`Problem submitting transaction`)
        toast.error(`Visit our Discord for assistance`);
      });
    } else if (client.signingClient !== undefined) {
      toast.loading("Processing your request...");
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
        toast.dismiss();
        refetch();
        toast.success(`Dice are rolling!`);
        toast.success(`Check back in a few seconds to view your result`);
      }).catch((e) => {
        toast.dismiss();
        console.log(e);
        toast.error(`Problem submitting transaction`)
        toast.error(`Visit our Discord for assistance`);
      });
    }
  }, [client?.walletAddress])

  if (!client || checkResponse.userStatus === "not_eligible") {
    return <ProgressBar tokenLeft={tokenLeft} claimPercentageLeft={claimPercentageLeft} />;
  } else {
    switch (checkResponse.userStatus) {
      case "ready": {
        return (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Progress bar */}
              <ProgressBar tokenLeft={tokenLeft} claimPercentageLeft={claimPercentageLeft} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Claim button */}
              {
                (tokenLeft > 20_000_000 || claimPercentageLeft !== 0) && (
                  <button
                    onClick={() => handleClaimRanddrop()}
                    className={`py-2 px-6 animate-pulse hover:animate-none hover:shaxdow-neon-md hover:bg-green-500/10 text-green-500 border border-green-500 rounded-xl bg-gradient-to-b from-green-500/10`}
                  >
                    {"Roll the dice!"}
                  </button>
                )
              }
            </div>
          </div>
        );
      }
      case "already_won": {
        return (
          <div className={`w-full h-full p-2 flex flex-col justify-start gap-y-2 items-center`}>
            <ProgressBar tokenLeft={tokenLeft} claimPercentageLeft={claimPercentageLeft} />
            <div className="text-nois-white/80 text-xs">
              {`Submitted at: ${submitted}`}
            </div>
            <div className="text-nois-white/80 text-xs">
              {`Finalized at: ${claimed}`}
            </div>
            <div className="text-nois-light-green text-base">
              {`Amount: ${winning_amount}`}
            </div>
            <div className=" flex flex-col gap-y-1">
              <button
                onClick={() => {
                  let link = BridgeLinks[checkResponse.chain];
                  routeNewTab(link);
                }}
                className="flex justify-center text-sm items-center rounded-lg px-4 py-1.5 border border-nois-light-green/30 text-nois-light-green/80 hover:text-nois-light-green hover:border-nois-light-green hover:bg-black"
              >
                {"Transfer to Nois Chain"}
              </button>
              <button
                onClick={() => routeNewTab("https://restake.app/nois")}
                className="flex justify-center text-sm items-center rounded-lg px-4 py-1.5 border border-nois-light-green/30 text-nois-light-green/80 hover:text-nois-light-green hover:border-nois-light-green hover:bg-black"
              >
                {"Stake on Nois Chain"}
              </button>

            </div>
          </div>
        )
      }
      case "already_lost": {
        return (
          <div className={`w-full h-full p-4 flex flex-col justify-start gap-y-2 items-center`}>
            <ProgressBar tokenLeft={tokenLeft} claimPercentageLeft={claimPercentageLeft} />
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
        return <ProgressBar tokenLeft={tokenLeft} claimPercentageLeft={claimPercentageLeft} />

      }
    }
  }
}
