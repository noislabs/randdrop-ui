"use client";
import type { NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
// import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import ChainList from "../components/chain-list";
import { WalletConnectModal } from "../components/connectWalletModal";
import { NoisFooter } from "../components/footer";
import {
  ChainSigningClient,
  useAllMultiClients,
} from "../contexts/userClients";
import { fetchUserStatus } from "../hooks/fetchUserStatus";
import noisLogo from "../public/nois_logo.png";
import { routeNewTab } from "../services/misc";
import { ChainType, CheckResponse } from "./api/check";

// Config for live / not live randdrop chains
export const AirdropLiveStatus: { [K in ChainType]: boolean } = {
  injective: true,
  juno: true,
  stargaze: true,
  aura: true,
  osmosis: false,
};

export type ChainProps = {
  name: string;
  status: string;
  refetch: any;
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse | undefined;
  walletLoading: boolean;
  logo: string;
};

const Home: NextPage = () => {
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
    disconnectAll,
  } = useAllMultiClients();

  // True if any client is connected
  const walletIsConnected = useMemo(() => {
    return !(
      !junoClient &&
      !injectiveClient &&
      !auraClient &&
      !osmosisClient &&
      !stargazeClient
    );
  }, [junoClient, injectiveClient, auraClient, osmosisClient, stargazeClient]);

  const {
    data: junoData,
    status: junoStatus,
    fetchStatus: junoFetchStatus,
    refetch: junoRefetch,
  } = useQuery(
    ["juno", junoClient?.walletAddress],
    () =>
      fetchUserStatus({ walletAddr: junoClient!.walletAddress, chain: "juno" }),
    {
      enabled: !!(junoClient && AirdropLiveStatus["juno"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      },
    }
  );

  const {
    data: osmosisData,
    status: osmosisStatus,
    fetchStatus: osmosisFetchStatus,
    refetch: osmosisRefetch,
  } = useQuery(
    ["osmosis", osmosisClient?.walletAddress],
    () =>
      fetchUserStatus({
        walletAddr: osmosisClient!.walletAddress,
        chain: "osmosis",
      }),
    {
      enabled: !!(osmosisClient && AirdropLiveStatus["osmosis"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      },
    }
  );

  const {
    data: injectiveData,
    status: injectiveStatus,
    fetchStatus: injectiveFetchStatus,
    refetch: injectiveRefetch,
  } = useQuery(
    ["injective", injectiveClient?.walletAddress],
    () =>
      fetchUserStatus({
        walletAddr: injectiveClient!.walletAddress,
        chain: "injective",
      }),
    {
      enabled: !!(injectiveClient && AirdropLiveStatus["injective"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      },
    }
  );

  const {
    data: auraData,
    status: auraStatus,
    fetchStatus: auraFetchStatus,
    refetch: auraRefetch,
  } = useQuery(
    ["aura", auraClient?.walletAddress],
    () =>
      fetchUserStatus({ walletAddr: auraClient!.walletAddress, chain: "aura" }),
    {
      enabled: !!(auraClient && AirdropLiveStatus["aura"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      },
    }
  );

  const {
    data: stargazeData,
    status: stargazeStatus,
    fetchStatus: stargazeFetchStatus,
    refetch: stargazeRefetch,
  } = useQuery(
    ["stargaze", stargazeClient?.walletAddress],
    () =>
      fetchUserStatus({
        walletAddr: stargazeClient!.walletAddress,
        chain: "stargaze",
      }),
    {
      enabled: !!(stargazeClient && AirdropLiveStatus["stargaze"]),
      refetchInterval: (data) => {
        if (data && data.userStatus === "waiting_randomness") {
          return 5_000;
        } else {
          return false;
        }
      },
    }
  );

  const chains: ChainProps[] = [
    {
      name: "Aura network",
      status: `${auraStatus}_${auraFetchStatus}`,
      refetch: auraRefetch,
      client: auraClient,
      checkResponse: auraData,
      walletLoading: walletLoading,
      logo: "https://pbs.twimg.com/profile_images/1737029336895778816/kgcJuHH-_400x400.jpg",
    },
    {
      name: "Juno",
      status: `${junoStatus}_${junoFetchStatus}`,
      refetch: junoRefetch,
      client: junoClient,
      checkResponse: junoData,
      walletLoading: walletLoading,
      logo: "https://pbs.twimg.com/profile_images/1637016727874674689/2C06aPqM_400x400.png",
    },
    {
      name: "Stargaze",
      status: `${stargazeStatus}_${stargazeFetchStatus}`,
      refetch: stargazeRefetch,
      client: stargazeClient,
      checkResponse: stargazeData,
      walletLoading: walletLoading,
      logo: "https://pbs.twimg.com/profile_images/1507391623914737669/U3fR7nxh_400x400.jpg",
    },
    {
      name: "Injective",
      status: `${injectiveStatus}_${injectiveFetchStatus}`,
      refetch: injectiveRefetch,
      client: injectiveClient,
      checkResponse: injectiveData,
      walletLoading: walletLoading,
      logo: "https://pbs.twimg.com/profile_images/1741980867453456384/OvMjkFJk_400x400.jpg",
    },
    {
      name: "Osmosis",
      status: `${osmosisStatus}_${osmosisFetchStatus}`,
      refetch: osmosisRefetch,
      client: osmosisClient,
      checkResponse: osmosisData,
      walletLoading: walletLoading,
      logo: "https://pbs.twimg.com/profile_images/1737332416002260992/fK84ceN0_400x400.jpg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen md:h-screen p-2 bg-nois-blue text-nois-white/90">
      <Head>
        <title>Nois Randdrop Checker by 0xSpit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Connect Wallet Header */}
      <div className="flex justify-between px-12 w-full border-b border-nois-white/10 ">
        <div
          onClick={() => routeNewTab("https://twitter.com/NoisRNG")}
          className="flex md:relative overflow-hidden hover:cursor-pointer "
        >
          <Image
            src={noisLogo}
            alt="Nois"
            //unoptimized
            className="scale-75 w-24 h-24"
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="h-full w-full md:w-auto hidden md:flex justify-center items-center gap-x-4 md:pr-8">
          <div
            className={`${
              nickname == "" ? "hidden" : "text-nois-light-green/60 text-sm"
            }`}
          >
            {`${nickname}`}
          </div>
          <WalletConnectModal />
        </div>
      </div>

      {/* Center */}
      <main className="flex flex-col justify-start items-center w-full  flex-grow">
        <div className="w-full flex flex-col  justify-center md:h-full items-center bgx-nois-blue overflow-y-auto">
          {/* No signingClients connected */}
          {!walletIsConnected ? (
            <div className="flex flex-col p-4 justify-around h-full w-full items-center">
              <span className="flex items-center text-2xl lg:text-3xl text-nois-white h-1/5">
                Welcome to the Nois Randdrop!
              </span>
              <div className="flex justify-center items-start w-full h-4/5 py-14">
                <div className="flex-col md:flex justify-center items-center gap-x-2 gap-y-2">
                  <div className="w-full flex justify-center">
                    <WalletConnectModal />
                  </div>
                  <div className="">
                    {`to see if you're eligible for some $NOIS tokens!`}
                    <div className="text-center mt-12">
                      made with ❤️ by{" "}
                      <a
                        href="https://twitter.com/0xSpit"
                        target="_blank"
                        className="text-nois-light-green/60"
                      >
                        @0xSpit
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-y-auto">
              {walletType === "metamask" ? (
                <ChainList
                  chains={chains.filter((chain) => chain.name !== "Injective")}
                />
              ) : (
                <div className="flex flex-col divide-x divide-gray-600 mx-auto max-w-7xl">
                  <ChainList chains={chains} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <NoisFooter />
    </div>
  );
};

export default Home;
