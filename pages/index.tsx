import type { NextPage } from 'next'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useSigningClient } from '../contexts/cosmwasm'
import { Coin } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject, SigningCosmWasmClient, WasmExtension } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import { EncodeObject } from '@cosmjs/proto-signing'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import { confetti, ConfettiFirstParam } from 'tsparticles-confetti';
import { Airdrop } from '@/lib/airdrop';
import { QueryClient } from '@cosmjs/stargate';
import { getBatchClient } from '../hooks/cosmwasm';
import { checkClaimed, claimAirdropMessage } from '../util/msg';
import { fromMicro, getAddressTable, validateAddresses } from '../util/addressConversion';

//const AirdropContractAddress = "nois19kfv6wdsmudx58a2hsktvegvtuyc4rakpsfsxqgmzg26p8ph4yrsteche4";
const AirdropContractAddress = "nois14wa2glah9t3c6x3cnfz2ys5t9er6zcrcvfvq8h0tfcv867q8n8tskvdplc";

const colors = ["#0ef025", "#ff00f7", "#ff0022", "#0015fc", "#eeff00"];

const sprayConfetti = (end: number) => {
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

const routeNewTab = () => {
  window.open(`https://twitter.com/NoisRNG`, "_blank", "noopener noreferrer");
}

type Status = "default" | "hasclaim" | "noclaim" | "alreadyclaimed";

const Home: NextPage = () => {
  const [batchClient, setBatchClient] = useState<QueryClient & WasmExtension | undefined>(undefined);

  useEffect(() => {
    getBatchClient().then((c) => {
      setBatchClient(c);
    }).catch((e) => {
      console.log(e);
    });
  }, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState('');
  const [status, setStatus] = useState<Status>('default');
  const [merkle, setMerkle] = useState<string[]>([]);
  const [amount, setAmount] = useState<string>("");

  const [injAmt, setInjAmt] = useState<string | undefined>();
  const [junoAmt, setJunoAmt] = useState<string | undefined>();
  const [starsAmt, setStarsAmt] = useState<string | undefined>();
  const [auraAmt, setAuraAmt] = useState<string | undefined>();

  const [userAddrNois, setUserAddrNois] = useState('');
  const [userAddrInj, setUserAddrInj] = useState('');
  const [userAddrStars, setUserAddrStars] = useState('');
  const [userAddrJuno, setUserAddrJuno] = useState('');
  const [userAddrAura, setUserAddrAura] = useState('');

  const checkOrClaimReady = (): boolean => {
    return userAddrNois !== '' && userAddrInj !== '' && userAddrStars !== '' && userAddrJuno !== '' && userAddrAura !== ''
  }

  const importAddress = (noisAddr: string) => {
    if (noisAddr.length < 3) {
      toast.error("ERROR: Must input a valid address!");
    } else {
      const addrTable = getAddressTable(noisAddr);
      setUserAddrInj(addrTable.injective);
      setUserAddrJuno(addrTable.juno);
      setUserAddrStars(addrTable.stargaze);
      setUserAddrAura(addrTable.aura);
    }
  }

  const resetAddresses = () => {
    setUserAddrInj('');
    setUserAddrJuno('');
    setUserAddrStars('');
    setUserAddrAura('');
  }

  const resetAmounts = () => {
    setInjAmt(undefined);
    setJunoAmt(undefined);
    setStarsAmt(undefined);
    setAuraAmt(undefined);
  }

  const checkAirdrop = async (address: string) => {

    const addresses = validateAddresses(userAddrInj, userAddrJuno, userAddrStars, userAddrAura);

    if (!addresses) {
      return;
    }

    setLoading(true);
    toast.loading("Checking addresses...");

    const randdropData = [
      'https://gist.githubusercontent.com/kaisbaccour/c26ede9d4219896bc03fb0fdfce310a3/raw/fa0825eb75607afad08ffb0fdead8567795150ad/injective-randdrop.json',
      'https://gist.githubusercontent.com/kaisbaccour/5a2f102ef476d533a3112b016aa45db4/raw/aa94b4d6682536ac518d1e98367b6bbc0eac5740/juno-randdrop.json',
      'https://gist.githubusercontent.com/kaisbaccour/ac8002e0329b4f54407e702c5dc4aa47/raw/1c8a75bdabf3dc04f77ed0d2c1cefedbba4fa060/stargaze-randdrop.json',
      'https://gist.githubusercontent.com/kaisbaccour/edf03e2486d1f6a609e2d8918cfcb4a9/raw/99ce180cc8e082615d0c010e0192d3d829693c48/aura-randdrop.json'
    ];

    const fetches = randdropData.map((url) => fetch(url));

    const responses = await Promise.all(fetches);

    const toJson = responses.map((res) => res.json());

    const [
      injData,
      junoData,
      starsData,
      auraData
    ] = await Promise.all(toJson);

    const [
      injDrop,
      junoDrop,
      starsDrop,
      auraDrop
    ] = [injData, junoData, starsData, auraData].map((data) => new Airdrop(data));

    const userInjDrop = injData.find((obj) => obj.address === addresses.injective);

    const userJunoDrop = junoData.find((obj) => obj.address === addresses.juno);

    const userStarsDrop = starsData.find((obj) => obj.address === addresses.stargaze);

    const userAuraDrop = auraData.find((obj) => obj.address === addresses.aura);

    toast.dismiss();
    setLoading(false);

    if ([userInjDrop, userJunoDrop, userStarsDrop, userAuraDrop].some((val) => val)) {
      sprayConfetti(Date.now() + 1500);
    } else {
      toast.error("No Randdrop available");
      setStatus('noclaim');
    }


    if (userInjDrop) {
      // Check Claim on Injective
      // const hasClaimed: boolean = await checkClaimed({walletAddress: address, batchClient: batchClient!});
      setInjAmt(String(userInjDrop.amount));
    }

    if (userJunoDrop) {
      // Check claimed on Juno
      setJunoAmt(String(userJunoDrop.amount));
    }

    if (userStarsDrop) {
      setStarsAmt(String(userStarsDrop.amount));
    }

    if (userAuraDrop) {
      setAuraAmt(String(userAuraDrop.amount));
    }

  }

  const claimAirdrop = () => {
    if (walletAddress.length < 3 || !signingClient) {
      toast.error("Wallet not connected");
      return;
    }

    if (merkle.length < 1 || status === 'noclaim') {
      toast.error("No claim available");
      return;
    }
    setLoading(true);
    toast.loading("Processing...");

    const msg: EncodeObject[] = [claimAirdropMessage({
      sender: walletAddress,
      amount: amount,
      proof: merkle
    })];

    signingClient
      .signAndBroadcast(walletAddress, msg, 'auto')
      .then((res) => {
        console.log("TX hash: " + res.transactionHash);
        setLoading(false);
        toast.dismiss();
        toast.success("Rand-drop claimed!");
        //confetti ?
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
        toast.dismiss();
        toast.error("Error claiming Rand-drop");
        toast.error(JSON.stringify(e.message));
      })
  }

  const { walletAddress, signingClient, nickname, connectWallet, disconnect } =
    useSigningClient();

  useEffect(() => {
    //setUserAddress(walletAddress);
    setUserAddrNois(walletAddress);
    resetAmounts();

    if (walletAddress.length > 3) {
      const addrTable = getAddressTable(walletAddress);
      setUserAddrInj(addrTable.injective);
      setUserAddrJuno(addrTable.juno);
      setUserAddrStars(addrTable.stargaze);
      setUserAddrAura(addrTable.aura);
    } else {
      setUserAddrInj("");
      setUserAddrJuno("");
      setUserAddrStars("");
      setUserAddrAura("");

    }
  }, [walletAddress])

  const handleConnect = () => {
    if (walletAddress.length < 3) {
      connectWallet();
    } else {
      disconnect();
    }
  };

  const reconnect = useCallback(() => {
    disconnect();
    connectWallet();
  }, [disconnect, connectWallet]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", reconnect);

    return () => {
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, [reconnect]);

  return (
    <div className="flex min-h-screen text-nois-white/90 h-screen flex-col py-2 bg-gradient-to-br from-black to-nois-blue">
      <Head>
        <title>Nois Rand-drop Checker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="grid grid-rows-6 items-start w-full h-full">

        {/* Connect wallet header */}
        <div className="row-span-1 bgx-nois-blue flex justify-between px-4 items-center">
          <div
            onClick={() => routeNewTab()}
            className="relative flex overflow-hidden hover:cursor-pointer w-1/6">
            <Image
              src={noisLogo}
              alt="Nois"
              unoptimized
              className="scale-50"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="text-4xl fontx-mono pb-4 pt-0 w-4/6 flex justify-center">
            Rand-drop Checker
          </div>
          <div className="w-1/6 h-full flex justify-center items-center">
            <button
              className={`border ${walletAddress.length < 3 ? "shadow-neon-md animate-pulse border-[#6ff2cf] text-[#6ff2cf] hover:bg-[#6ff2cf30]" : "border-white/30 text-nois-white hover:bg-white/20 "} rounded-lg hx-1/2 px-4 py-2`}
              onClick={() => handleConnect()}
            >
              {walletAddress.length < 3 ? "Connect" : nickname}
            </button>
          </div>
        </div>

        {/* Center component */}
        <div className="row-span-5 pt-20 flex flex-col gap-y-8 justify-center items-center bgx-nois-blue">
          <div className="flex gap-x-4 w-2/3 justify-center items-center">
            <input
              className="w-1/2 px-3 py-2 outline-none rounded-lg placeholder-white/50 bg-slate-500/10 border border-nois-white/30 focus:bg-slate-500/20 focus:border-nois-white/60"
              placeholder='nois1...'
              onChange={e => setUserAddrNois(e.target.value)}
              value={userAddrNois}
            />
            <button
              className={` hover:bg-white/20 px-4 py-2 rounded-lg border border-white/30 text-nois-white`}
              onClick={() => importAddress(userAddrNois)}
            >
              <span>
                Submit
              </span>
            </button>
          </div>
          <div className="flex flex-col gap-y-2 w-5/6 justify-center items-center borderx">
            <div className="flex gap-x-2 w-full">
              <div className="flex flex-col w-1/2 gap-y-1">
                <div className="p-2 flex justify-start gap-x-4 text-nois-white border border-nois-white/30 bg-slate-600/10">
                  <span className="text-nois-white/30">
                    {"Injective:"}
                  </span>
                  {userAddrInj.length > 3 ?
                    userAddrInj :
                    <div className="text-nois-white/50">Connect wallet or Enter address above</div>
                  }
                </div>
                <div className={`${injAmt ? "text-green-500" : "text-red-400"} text-sm w-full flex justify-end`}>
                  {injAmt ? `Injective Amount: ${fromMicro(injAmt)}` : "None"}
                </div>
              </div>
              <div className="flex flex-col w-1/2 gap-y-1">
                <div className="p-2 flex justify-start gap-x-4 text-nois-white border border-nois-white/30 bg-slate-600/10">
                  <span className="text-nois-white/30">
                    {"Juno:"}
                  </span>
                  {userAddrJuno.length > 3 ?
                    userAddrJuno :
                    <div className="text-nois-white/50">Connect wallet or Enter address above</div>
                  }
                </div>
                <div className={`${junoAmt ? "text-green-500" : "text-red-400"} text-sm w-full flex justify-end`}>
                  {junoAmt ? `Juno Amount: ${fromMicro(junoAmt)}` : "None"}
                </div>
              </div>
            </div>
            <div className="flex gap-x-2 w-full">
              <div className="flex flex-col w-1/2 gap-y-1">
                <div className="p-2 flex justify-start gap-x-4 text-nois-white border border-nois-white/30 bg-slate-600/10">
                  <span className="text-nois-white/30">
                    {"Stargaze:"}
                  </span>
                  {userAddrStars.length > 3 ?
                    userAddrStars :
                    <div className="text-nois-white/50">Connect wallet or Enter address above</div>
                  }
                </div>
                <div className={`${starsAmt ? "text-green-500" : "text-red-400"} text-sm w-full flex justify-end`}>
                  {starsAmt ? `Stargaze Amount: ${fromMicro(starsAmt)}` : "None"}
                </div>
              </div>
              <div className="flex flex-col w-1/2 gap-y-1">
                <div className="p-2 flex justify-start gap-x-4 text-nois-white border border-nois-white/30 bg-slate-600/10">
                  <span className="text-nois-white/30">
                    {"Aura:"}
                  </span>
                  {userAddrAura.length > 3 ?
                    userAddrAura :
                    <div className="text-nois-white/50">Connect wallet or Enter address above</div>
                  }
                </div>
                <div className={`${auraAmt ? "text-green-500" : "text-red-400"} text-sm w-full flex justify-end`}>
                  {auraAmt ? `Aura Amount: ${fromMicro(auraAmt)}` : "None"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-x-4 text-xl ">
            {checkOrClaimReady() === true ? (
              <>
                <button
                  className={`${loading === true ? "opacity-50" : "hover:bg-white/20"} px-4 py-2 rounded-lg border border-white/30 text-nois-white`}
                  onClick={() => {
                    if (loading !== true) {
                      if (!batchClient) {
                        console.log("No client to query with");
                      } else {
                        checkAirdrop(userAddress);
                      }
                    }
                  }}
                >
                  <span className={`${loading === true ? "animate-ping" : ""}`}>
                    {loading === true ? "..." : "Check"}
                  </span>
                </button>
                {/* <button 
                  className={`${loading === true ? "opacity-50" : "hover:bg-white/20"} px-4 py-2 rounded-lg border border-white/30 text-nois-white`}
                  onClick={() => {
                    if (loading !== true) {
                      if (status === 'alreadyclaimed') {
                        toast.error("Rand-drop already claimed");
                      } else if (walletAddress.length < 3) {
                        toast.error("ERROR: Wallet not connected");
                      } else {
                        claimAirdrop();
                      }
                    }
                  }}
                >
                  <span className={`${loading === true ? "animate-ping" : ""}`}>
                    {loading === true ? "..." : "Claim"}
                  </span>
                </button> */}
              </>
            ) : (
              <>
                <button
                  className={`px-4 py-2 rounded-lg border border-white/20 text-nois-white/50 hover:cursor-not-allowed`}
                  onClick={() => toast.error("ERROR: Connect Wallet or Input a valid address")}
                >
                  <span>
                    {"Check"}
                  </span>
                </button>
                {/* <button 
                  className={`px-4 py-2 rounded-lg border border-white/20 text-nois-white/50 hover:cursor-not-allowed`}
                  onClick={() => toast.error("ERROR: Must Connect Wallet")}
                >
                  <span>
                    {"Claim"}
                  </span>
                </button> */}
              </>
            )}
          </div>
          <div className={`${status !== 'alreadyclaimed' && "hidden"} flex gap-x-2 p-2 text-xl rounded-lg bg-[#ffffff10]`}>
            <span className='text-white/40'>
              Looks like you've already claimed your rand-drop
            </span>
          </div>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center">
        <a
          className="flex items-center justify-center gap-2 link hover:underline hover:underline-offset-4"
          href="https://github.com/NoisLabs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
      </footer>
    </div>
  )
}

export default Home
