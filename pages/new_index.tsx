'use client'
import type { NextPage } from 'next'
import { useContext, useMemo } from 'react'
import Head from 'next/head'
// import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import Image, { StaticImageData } from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../hooks/fetchUserStatus';
import { NoisFooter } from '../components/footer'
import { ChainCard } from '../components/chainCards'
import { WalletConnectModal } from '../components/connectWalletModal'
import { useAllMultiClients } from '../contexts/userClients'
import { routeNewTab } from '../services/misc';
import { ChainType, CheckResponse } from '../services/apiHelpers';
import NextImage from "next/image";
import StargazeLogo from "../public/BIGstars.png";
import InjectiveLogo from "../public/INJECTIVE400x400.jpg";
import JunoLogo from "../public/JUNO400x400.png";
import AuraLogo from "../public/AURA400x400.jpg";
import OsmosisLogo from "../public/OSMOSIS400x400.png";


// Config for live / not live randdrop chains
export const AirdropLiveStatus: { [K in ChainType]: boolean } = {
  "injective": true,
  "juno": true,
  "stargaze": false,
  "aura": false,
  "osmosis": false,
};

export const ChainLogos: { [K in ChainType]: StaticImageData } = {
  "injective": InjectiveLogo,
  "juno": JunoLogo,
  "stargaze": StargazeLogo,
  "aura": AuraLogo,
  "osmosis": OsmosisLogo,
}


const MainPage: NextPage = () => {



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
        {/* <div className="h-full w-full md:w-auto hidden md:flex justify-center items-center gap-x-4 md:pr-8">
          <div className={`${nickname == "" ? "hidden" : "text-nois-light-green/60 text-sm"}`}>
            {`${nickname}`}
          </div>
          <WalletConnectModal />
        </div> */}
      </div>

      {/* Center */}
      <main className="flex flex-col justify-start items-center w-full h-[100vh] md:h-[70vh] flex-grow">
        <div className="w-full h-full flex flex-col gap-y-8 overflow-y-auto">
          {/* No signingClients connected */}
            <div className="flex flex-col p-3 justify-start md:gap-y-2 h-full w-full items-center">
              <span className="flex items-center text-2xl lg:text-3xl text-nois-white">
                {"Welcome to the Nois Randdrop!"}
              </span>
              <span className="flex items-center text-lg lg:text-xl text-nois-white">
                Select a chain to continue
              </span>
              <div className="flex flex-col items-center md:flex-row justify-between w-full h-full ">
                {ChainType.options.map((chain) => (
                  <div key={`${chain}`} className="w-full h-full p-2 md:p-4">
                    <div
                      onClick={() => window.open(`${window.location.origin}/${chain}`, "_blank", "noopener noreferrer")}
                      className="w-full h-full py-4 border-1 border-nois-white/30 rounded-3xl hover:cursor-pointer hover:bg-white/10">
                    <div className="h-[75%] md:h-[30%] lg:h-[50%] flex justify-center p-0 md:p-1">
                      <div className="relative aspect-square ">
                        <NextImage
                          src={ChainLogos[chain]}
                          alt={`${chain}_logo`}
                          unoptimized
                          objectFit="fill"
                          fill={true}
                          className={`rounded-full`}
                        />
                      </div>
                    </div>
                    <span className="flex justify-center w-full text-xl py-1 text-nois-white">
                      {`${chain.slice(0, 1).toUpperCase()}${chain.slice(1)}`}
                    </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="flex justify-center items-start w-full h-4/5 py-14">
                <div className="flex-col md:flex justify-center items-center gap-x-2 gap-y-2">
                  <div className="w-full flex justify-center">
                    <WalletConnectModal />
                  </div>
                  <div className="">
                    {`to see if you're eligible for some $NOIS tokens!`}
                  </div>
                </div>
              </div> */}
            </div>

        </div>

      </main>
      <NoisFooter />
    </div>
  )
}

export default MainPage;

