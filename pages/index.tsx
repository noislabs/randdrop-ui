'use client'
import type { NextPage } from 'next'
import { useContext, useMemo } from 'react'
import Head from 'next/head'
// import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../hooks/fetchUserStatus';
import { NoisFooter } from '../components/footer'
import { ChainCard } from '../components/chainCards'
import { WalletConnectModal } from '../components/connectWalletModal'
import { useAllMultiClients } from '../contexts/userClients'
import { routeNewTab } from '../services/misc';
import { ChainType, CheckResponse } from './api/check';

// Config for live / not live randdrop chains
export const AirdropLiveStatus: { [K in ChainType]: boolean } = {
  "injective": true,
  "juno": true,
  "uni": false,
  "stargaze": true,
  "aura": true,
  "osmosis": true,
};

const Home: NextPage = () => {

  const {
    walletType,
    uniClient,
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
    return !(!uniClient && !junoClient && !injectiveClient && !auraClient && !osmosisClient && !stargazeClient)
  }, [uniClient, junoClient, injectiveClient, auraClient, osmosisClient, stargazeClient])

  // Hitting /api/check for user's status
  const {
    data: uniData,
    status: uniStatus,
    fetchStatus: uniFetchStatus,
    refetch: uniRefetch
  } = useQuery(
    ["uni", uniClient?.walletAddress],
    () => fetchUserStatus({ walletAddr: uniClient!.walletAddress, chain: "uni" }),
    {
      enabled: !!(uniClient && AirdropLiveStatus["uni"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: junoData,
    status: junoStatus,
    fetchStatus: junoFetchStatus,
    refetch: junoRefetch
  } = useQuery(
    ["juno", junoClient?.walletAddress],
    () => fetchUserStatus({ walletAddr: junoClient!.walletAddress, chain: "juno" }),
    {
      enabled: !!(junoClient && AirdropLiveStatus["juno"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: osmosisData,
    status: osmosisStatus,
    fetchStatus: osmosisFetchStatus,
    refetch: osmosisRefetch
  } = useQuery(
    ["osmosis", osmosisClient?.walletAddress],
    () => fetchUserStatus({walletAddr: osmosisClient!.walletAddress, chain: "osmosis"}),
    {
      enabled: !!(osmosisClient && AirdropLiveStatus["osmosis"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: injectiveData,
    status: injectiveStatus,
    fetchStatus: injectiveFetchStatus,
    refetch: injectiveRefetch
  } = useQuery(
    ["injective", injectiveClient?.walletAddress],
    () => fetchUserStatus({ walletAddr: injectiveClient!.walletAddress, chain: "injective" }),
    {
      enabled: !!(injectiveClient && AirdropLiveStatus["injective"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: auraData,
    status: auraStatus,
    fetchStatus: auraFetchStatus,
    refetch: auraRefetch
  } = useQuery(
    ["aura", auraClient?.walletAddress],
    () => fetchUserStatus({ walletAddr: auraClient!.walletAddress, chain: "aura" }),
    {
      enabled: !!(auraClient && AirdropLiveStatus["aura"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: stargazeData,
    status: stargazeStatus,
    fetchStatus: stargazeFetchStatus,
    refetch: stargazeRefetch
  } = useQuery(
    ["stargaze", stargazeClient?.walletAddress],
    () => fetchUserStatus({ walletAddr: stargazeClient!.walletAddress, chain: "stargaze" }),
    {
      enabled: !!(stargazeClient && AirdropLiveStatus["stargaze"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 1_000;
        } else {
          return false;
        }
      }
    }
  );

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
        <div className="h-full w-full md:w-auto hidden md:flex justify-center items-center gap-x-4 md:pr-8">
          <div className={`${nickname == "" ? "hidden" : "text-nois-light-green/60 text-sm"}`}>
            {`${nickname}`}
          </div>
          <WalletConnectModal />
        </div>
      </div>

      {/* Center */}
      <main className="flex flex-col justify-start items-center w-full md:h-[70vh] flex-grow">
        <div className="w-full flex flex-col gap-y-8 justify-center md:h-full items-center bgx-nois-blue overflow-y-auto">
          {/* No signingClients connected */}
          {!walletIsConnected ? (
            <div className="flex flex-col p-4 justify-around h-full w-full items-center">
              <span className="flex items-center text-2xl lg:text-3xl text-nois-white h-1/5">
                {'Welcome to the Nois Randdrop!'}
              </span>
              <div className="flex justify-center items-start w-full h-4/5 py-14">
                <div className="flex-col md:flex justify-center items-center gap-x-2 gap-y-2">
                  <div className="w-full flex justify-center">
                    <WalletConnectModal />
                  </div>
                  <div className="">
                    {`to see if you're eligible for some $NOIS tokens!`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-800/0 w-full overflow-y-auto md:h-full grid grid-rows-5 lg:grid-cols-5 lg:px-8 lg:py-4">
              {/* <ChainCard chain='uni' chainStatus={`${uniStatus}_${uniFetchStatus}`} refetch={uniRefetch} client={uniClient} checkResponse={uniData} walletLoading={walletLoading}/> */}
              {
                (
                  walletType === 'metamask' ? (
                    <ChainCard chain='injective' chainStatus={`${injectiveStatus}_${injectiveFetchStatus}`} refetch={injectiveRefetch} client={injectiveClient} checkResponse={injectiveData} walletLoading={walletLoading} />
                  ) : (
                    <>
                      <ChainCard chain='juno' chainStatus={`${junoStatus}_${junoFetchStatus}`} refetch={junoRefetch} client={junoClient} checkResponse={junoData} walletLoading={walletLoading} />
                      <ChainCard chain='injective' chainStatus={`${injectiveStatus}_${injectiveFetchStatus}`} refetch={injectiveRefetch} client={injectiveClient} checkResponse={injectiveData} walletLoading={walletLoading} />
                      <ChainCard chain='aura' chainStatus={`${auraStatus}_${auraFetchStatus}`} refetch={auraRefetch} client={auraClient} checkResponse={auraData} walletLoading={walletLoading} />
                      <ChainCard chain='osmosis' chainStatus={`${osmosisStatus}_${osmosisFetchStatus}`} refetch={osmosisRefetch} client={osmosisClient} checkResponse={osmosisData} walletLoading={walletLoading}/>
                      <ChainCard chain='stargaze' chainStatus={`${stargazeStatus}_${stargazeFetchStatus}`} refetch={stargazeRefetch} client={stargazeClient} checkResponse={stargazeData} walletLoading={walletLoading} />
                    </>
                  )
                )
              }
            </div>
            
          )}
        </div>

      </main>
      <NoisFooter />
    </div>
  )
}

export default Home

