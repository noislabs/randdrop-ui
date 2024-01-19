'use client'
import type { NextPage } from 'next'
import { useContext, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
// import { useMultiKeplr, useMultiWallet } from '../hooks/useKeplr'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../../public/nois_logo.png';
// import { useQuery } from '@tanstack/react-query';
// import { fetchUserStatus } from '../hooks/fetchUserStatus';
// import { NoisFooter } from '../components/footer'
// import { ChainCard } from '../components/chainCards'
// import { WalletConnectModal } from '../components/connectWalletModal'
// import { useAllMultiClients } from '../contexts/userClients'
import { routeNewTab } from '../../services/misc';
import { ChainType, CheckResponse } from '../../services/apiHelpers';
import { useRouter } from 'next/router';
import { ChainLogos } from '../new_index';
import { NoisFooter } from '../../components/footer';


export default function ChainPage() {

  const router = useRouter();

  const [chain, setChain] = useState<string | undefined>();

  useEffect(() => {
    if (!router.isReady) return;
    const page_chain = router.query.chain as string;
    if (!ChainType.options.find((chain) => chain === page_chain)) {
      router.replace("/404")
    }
    setChain(page_chain);
  }, [router.isReady])

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
      <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-3 justify-between">
        <div className="w-full h-full md:col-span-1 border">
          <div className="w-full h-full py-4">
            <div className="h-[75%] md:h-[30%] lg:h-[50%] flex justify-center p-0 md:p-1">
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
            <span className="flex justify-center w-full text-2xl py-1 text-nois-white">
              {`${chain?.slice(0, 1).toUpperCase()}${chain?.slice(1)}`}
            </span>
            <div className="w-full flex flex-col px-10 py-4">
            <ProgressBar percentageLeft={15}/>
              <span className="py-1 text-xs text-nois-white/40">
                Tokens claimed this round
              </span>
            </div>
          </div>
        </div>



        <div className="w-full h-full md:col-span-2 p-4 flex flex-col items-start gap-y-2 border">
          <button className="border text-nois-white rounded-lg py-1.5 px-3 flex justify-center items-center">
            Conect Wallet
          </button>
          <div className="w-full h-full border bg-red-500">
          lsjfdlkj
          </div>
        </div>
      </div>
      <NoisFooter/>
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


// const ProgressBar = ({percentageLeft}:{percentageLeft: number}) => {
//
//   const {filled, cf} = useMemo(() => {
//     const f = 100 - percentageLeft;
//     return {
//       filled: f,
//       cf: `w-[${f}%]`
//     }
//     // return {100 - percentageLeft, `w-[${100 - percentageLeft}%]`}
//   }, [percentageLeft])
//
//   return (
//     <div className="w-full bg-neutral-200 dark:bg-neutral-600">
//       <div className={`bg-primary ${cf} p-0.5 text-center text-xs font-medium leading-none text-primary-100`}>
//         {`${filled}%`}
//       </div>
//     </div>
//   )
// }

