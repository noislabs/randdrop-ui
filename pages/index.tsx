'use client'
import type { NextPage } from 'next'
import { useContext, useMemo } from 'react'
import Head from 'next/head'
import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import DotLoader from '../components/dotLoader';
import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../hooks/fetchUserStatus';
import { NoisFooter } from '../components/footer'
import { WalletNotConnected } from '../components/noWallet'
import { ChainCard } from '../components/chainCards'
import { WalletConnectModal } from '../components/connectWalletModal'
import { useMultiLeap } from '../hooks/useLeap'
import { WalletSelectContext } from '../contexts/cosmwasm'

const routeNewTab = () => {
  window.open(`https://twitter.com/NoisRNG`, "_blank", "noopener noreferrer");
}

const Home: NextPage = () => {

  const {currentWalletType, changeWalletType} = useContext(WalletSelectContext);

  // const {
  //   uniClient,
  //   junoClient,
  //   injectiveClient,
  //   stargazeClient,
  //   auraClient,
  //   loading: walletLoading,
  //   nickname,
  //   handleConnectAll,
  //   disconnectAll
  // } = useMemo(() => {
  //   return useMultiWallet(currentWalletType);
  //   //return v;
  // }, [currentWalletType]);

  const {
    uniClient,
    junoClient,
    injectiveClient,
    stargazeClient,
    auraClient,
    loading: walletLoading,
    nickname,
    handleConnectAll,
    disconnectAll
  } = useMultiWallet();

  // True if any client is connected
  const walletIsConnected = useMemo(() => {
    return !(!uniClient && !junoClient && !injectiveClient && !auraClient && !stargazeClient)
  }, [uniClient, junoClient, injectiveClient, auraClient, stargazeClient])

  // Hitting /api/check for user's status
  const {
    data: uniData,
    status: uniStatus
  } = useQuery(
    ["uni", uniClient?.walletAddress],
    () => fetchUserStatus({walletAddr: uniClient!.walletAddress, chain: "uni"}),
    {
      enabled: !!uniClient,
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 30_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: junoData,
    status: junoStatus
  } = useQuery(
    ["juno", junoClient?.walletAddress],
    () => fetchUserStatus({walletAddr: junoClient!.walletAddress, chain: "juno"}),
    {
      enabled: !!junoClient,
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 30_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: injectiveData,
    status: injectiveStatus
  } = useQuery(
    ["injective", injectiveClient?.walletAddress],
    () => fetchUserStatus({walletAddr: injectiveClient!.walletAddress, chain: "injective"}),
    {
      enabled: !!injectiveClient,
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 30_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: auraData,
    status: auraStatus
  } = useQuery(
    ["aura", auraClient?.walletAddress],
    () => fetchUserStatus({walletAddr: auraClient!.walletAddress, chain: "aura"}),
    {
      enabled: !!auraClient,
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 30_000;
        } else {
          return false;
        }
      }
    }
  );

  const {
    data: stargazeData,
    status: stargazeStatus
  } = useQuery(
    ["stargaze", stargazeClient?.walletAddress],
    () => fetchUserStatus({walletAddr: stargazeClient!.walletAddress, chain: "stargaze"}),
    {
      enabled: !!stargazeClient,
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 30_000;
        } else {
          return false;
        }
      }
    }
  );

  return (
    <div className="flex min-h-screen text-nois-white/90 h-screen flex-col p-2 bg-nois-blue ">
      <Head>
        <title>Nois Rand-drop Checker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col justify-start items-center w-full h-full">

        {/* Connect wallet header */}
        <div className="flex justify-between h-[15vh] px-12 w-full border-b border-nois-white/10 ">
          <div
            onClick={() => routeNewTab()}
            className="hidden md:flex md:relative overflow-hidden hover:cursor-pointer ">
            <Image
              src={noisLogo}
              alt="Nois"
              //unoptimized
              className="scale-75"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="h-full w-full md:w-auto flex justify-center items-center gap-x-4 md:pr-8">
            <div className={`${nickname == "" ? "hidden" : "text-nois-white/60 text-sm"}`}>
              {`${nickname}`}
            </div>
            <button
              className={`flex justify-center items-center w-[30vw] md:w-[20vw] lg:w-[11vw] h-[7.5vh] rounded-xl px-4 py-2 border border-nois-white/30 text-nois-white/80 hover:text-nois-white hover:bg-gray-700/30`}
              onClick={() => walletLoading ? {} : handleConnectAll()}
            >
              {walletLoading ? (
                  <DotLoader/>
              ):(
                <span className="w-full overflow-hidden overflow-ellipsis">
                  {nickname == "" ? "Connect Wallet" : "Disconnect"}
                </span>
              )}
            </button>
            <WalletConnectModal />
          </div>
        </div>

        {/* Center component */}
        <div className="w-full flex h-full md:h-[70vh] flex-col gap-y-8 justify-center items-center bgx-nois-blue">
          {/* No signingClients connected */}
          {!walletIsConnected ? (
            <WalletNotConnected handleConnectAll={handleConnectAll} walletLoading={walletLoading} />
          ):(
            <div className="bg-red-800/0 w-full h-[100vh] overflow-y-auto md:h-full grid grid-rows-4 lg:grid-cols-4 lg:px-8 lg:py-4">
              <ChainCard chain='uni' chainStatus={uniStatus} client={uniClient} checkResponse={uniData} walletLoading={walletLoading}/>
              {/* <ChainCard chain='juno' chainStatus={junoStatus} client={junoClient} checkResponse={junoData} walletLoading={walletLoading}/> */}
              <ChainCard chain='injective' chainStatus={injectiveStatus} client={injectiveClient} checkResponse={injectiveData} walletLoading={walletLoading}/>
              <ChainCard chain='aura' chainStatus={auraStatus} client={auraClient} checkResponse={auraData} walletLoading={walletLoading}/>
              <ChainCard chain='stargaze' chainStatus={stargazeStatus} client={stargazeClient} checkResponse={stargazeData} walletLoading={walletLoading}/>
            </div>
          )}
        </div>
      </main>
      <NoisFooter/>
    </div>
  )
}

export default Home

