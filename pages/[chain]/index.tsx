'use client'
import type { NextPage } from 'next'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
// import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../../public/nois_logo.png';
import { routeNewTab } from '../../services/misc';
import { ChainType, CheckResponse } from '../../services/apiHelpers';
import { useRouter } from 'next/router';
import { ChainLogos } from '../new_index';
import { NoisFooter } from '../../components/footer';
import { WalletConnectModal } from '../../components/connectWalletModal';
import DotLoader from '../../components/dotLoader';
import DiceLoader from '../../components/diceLoader';
import { parseTimestamp } from '../../services/parsing';
import { useAllMultiClients } from '../../contexts/userClients';
import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../../hooks/fetchUserStatus';
import { signSendAndBroadcastOnInjective } from '../../services/injective';
import { ethLedgerTxHelper } from '../../services/ledgerHelpers';
import { randdropClaimMsg } from '../../services/contractTx';

// Config for live / not live randdrop chains
export const AirdropLiveStatus: { [K in ChainType]: boolean } = {
  "injective": true,
  "juno": true,
  "stargaze": false,
  "aura": false,
  "osmosis": false,
};

export const cosmosErrorToast = (err: any) => {
  toast.error("Problem submitting transaction");
  if (`${err}`.includes("gas wanted")) {
    toast.error("Wallet does not have enough gas for transaction");
  } else {
    toast.error(`${err}`);
  }
}

export default function ChainPage() {

  const router = useRouter();

  const [chain, setChain] = useState<ChainType | undefined>();

  useEffect(() => {
    if (!router.isReady) return;
    const page_chain = router.query.chain as string;
    if (!ChainType.options.find((chain) => chain === page_chain)) {
      router.replace("/404")
    }
    setChain(page_chain as ChainType);
  }, [router.isReady])


  const {
    walletType,
    junoClient,
    injectiveClient,
    stargazeClient,
    auraClient,
    osmosisClient,
    loading: walletLoading,
    nickname,
    handleConnectAll,
    disconnectAll
  } = useAllMultiClients();

  // True if any client is connected
  const walletIsConnected = useMemo(() => {
    return !( !junoClient && !injectiveClient && !auraClient && !osmosisClient && !stargazeClient)
  }, [ junoClient, injectiveClient, auraClient, osmosisClient, stargazeClient])


  const client = useMemo(() => {
    switch (chain) {
      case "juno": {
        return junoClient;
      }
      case "aura": {
        return auraClient;
      }
      case "osmosis": {
        return osmosisClient;
      }
      case "stargaze": {
        return stargazeClient;
      }
      case "injective": {
        return injectiveClient;
      }
      default: {
        return undefined;
      }
    }
  }, [chain, walletLoading, walletIsConnected])

  const {
    data: checkResponse,
    status: checkStatus,
    fetchStatus: fetchStatus,
    refetch: refetch
  } = useQuery(
    [`${chain ?? "na"}`, `${client?.walletAddress ?? "noaddr"}`, `${client?.walletType ?? "nowallet"}`],
    () => fetchUserStatus({ walletAddr: client!.walletAddress, chain: chain! }),
    {
      enabled: !!(client && AirdropLiveStatus[chain ?? "na"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    submitted,
    claimed,
    winning_amount
  } = useMemo(() => {
    const submitted = checkResponse?.submitted_at ? parseTimestamp(checkResponse.submitted_at) : "";
    const claimed = checkResponse?.claimed_at ? parseTimestamp(checkResponse.claimed_at) : "";
    const winning_amount = checkResponse?.winning_amount ?
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
      toast.error(`Wallet or Ledger not connected for ${checkResponse?.chain}`);
      return;
    }

    // Assert claim_contract exists
    if (!checkResponse?.claim_contract) {
      toast.error(`No randdrop contract available for ${checkResponse?.chain}`);
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
        cosmosErrorToast(e);
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
        cosmosErrorToast(e);
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
        cosmosErrorToast(e);
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
        cosmosErrorToast(e);
      });
    }
  }, [client?.walletAddress])


  return (
    <div className="flex flex-col min-h-screen md:h-screen p-2 bg-nois-blue text-nois-white/90">
      <Head>
        <title>Nois Randdrop Checker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Connect Wallet Header */}
      <div className="flex justify-between h-[15vh] px-12 w-full border-b border-nois-white/10 ">
        <div
          onClick={() => routeNewTab("https://twitter.com/NoisRNG")}
          className="flex md:relative overflow-hidden hover:cursor-pointer ">
          <Image
            src={noisLogo}
            alt="Nois"
            //unoptimized
            className="scale-75"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
      <div className="w-full p-4 grid grid-cols-1 max-h-[100vh] min-h-[80vh] md:grid-cols-3 justify-between ">
        <div className="w-full h-full md:col-span-1 ">
          <div className="w-full h-full py-4">
            <div className="h-[50%] md:h-[30%] lg:h-[50%] flex justify-center p-0 md:p-1">
              <div className="relative aspect-square ">
                {chain && (
                  <Image
                    src={ChainLogos[chain]}
                    alt={`${chain}_logo`}
                    unoptimized
                    objectFit="fill"
                    fill={true}
                    className={`rounded-full`}
                  />
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 mx-auto flex flex-col px-10 py-4">
              {chain && (
                <DropDown currentChain={chain} />
              )}
            </div>
            <div className="w-full flex flex-col px-10 py-4">
            <ProgressBar percentageLeft={15}/>
              <span className="py-1 text-xs text-nois-white/40">
                Tokens claimed this round
              </span>
            </div>
          </div>
        </div>



        <div className="w-full h-full md:col-span-2 py-4 px-2 flex flex-col items-start gap-y-2 ">
          <div className="flex gap-x-1.5">
            <WalletConnectModal />
          {client && checkResponse?.userStatus === "ready" && (
            <button
                onClick={() => handleClaimRanddrop()}
                className="border-1 border-green-500 text-green-500 rounded-lg py-1.5 px-3 flex justify-center items-center animate-pulse hover:bg-nois-green/10 hover:animate-none">
              Roll Dice!
            </button>
          )}
          </div>
          <div className="w-full h-full p-2 border-1 border-white/20 rounded-lg text-nois-white/50 ">
            {!client && !walletLoading && (
              <span> Connect wallet to get started </span>
            )}
            {!client && walletLoading && (
              <div className="h-full w-full flex justify-center items-center">
                <div className="circle-spinner"/>
              </div>
            )}
            {client && checkResponse?.userStatus === "ready" && (
              <div className="w-full h-full flex justify-around items-start">
                <span className=" w-1/2 text-nois-white/60">Eligible amount</span>
                <span className="w-1/2 text-nois-white">{checkResponse.amount}</span>
              </div>
            )}
            {client && checkResponse?.userStatus === "waiting_randomness" && chain && (
              <>
              <span>Dice are rolling! Check back soon</span>
              <div className="h-full w-full flex justify-center items-center">
                <DiceLoader chain={chain} />
              </div>
              </>
            )}
            {client && checkResponse?.userStatus === "already_won" && (
              <div className="h-full w-full flex flex-col justify-start gap-y-4 items-start">
                <span className="text-green-500 text-xl md:text-3xl">
                  {`You won ${winning_amount} NOIS! 🎉`}
                </span>
                <button className="border text-nois-white rounded-lg py-1.5 px-3 flex justify-center items-center">
                  Nois Staking
                </button>
                <button className="border text-nois-white rounded-lg py-1.5 px-3 flex justify-center items-center">
                  IBC Transfer
                </button>

              </div>
            )}
            {client && checkResponse?.userStatus === "already_lost" && (
              <span className="text-red-500/50">Did not win</span>
            )}
            {client && checkResponse?.userStatus === "not_eligible" && (
              <span className="text-nois-white/50">Account not eligible</span>
            )}
          </div>
        </div>
      </div>
      <NoisFooter/>
    </div>

  )
}

const DropDown = ({currentChain}:{currentChain: ChainType}) => {

  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-nois-white border-1 border-nois-white/50 shadow-sm hover:bg-nois-white/10" onClick={() => setOpen(!open)} id="menu-button" aria-expanded={`${open}`} aria-haspopup="true">
         {currentChain.slice(0, 1).toUpperCase() + currentChain.slice(1)}
          <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className={`${!open && "hidden"} absolute right-0 z-10 mt-2 w-56 origin-top-right bg-nois-blue border-1 border-nois-white/30 rounded-lg`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" >
        <div className="py-1 px-1" role="none">
          {ChainType.options.map((chain) => {
            if (chain !== currentChain) {
              return (
                <div
                  onClick={() => window.open(`${window.location.origin}/${chain}`, "_blank", "noopener noreferrer")}
                  className="text-nois-white/80 block px-4 py-2 text-sm rounded-md hover:bg-gray-500/10 hover:text-nois-white hover:cursor-pointer" key={`${chain}`} role="menuItem">
                  {`${chain.slice(0, 1).toUpperCase() + chain.slice(1)}`}
                </div>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

const ProgressBar = ({ percentageLeft }: { percentageLeft: number }) => {
  const filled = useMemo(() => 100 - percentageLeft, [percentageLeft]);

  return (
    <div className="w-full h-8 border-1 border-white/50 bg-black overflow-clip rounded-lg ">
      <div
        style={{ width: `${filled}%` }}
        className="bg-green-900 h-full p-0.5 flex items-center justify-center text-sm leading-none text-white"
      >
        {`${filled}%`}
      </div>
    </div>
  );
};


