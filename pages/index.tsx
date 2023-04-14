import type { NextPage } from 'next'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useSigningClient } from '../contexts/cosmwasm'
import { Coin } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import { EncodeObject } from '@cosmjs/proto-signing'
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import { confetti, ConfettiFirstParam } from 'tsparticles-confetti';
import { Airdrop } from '@/lib/airdrop';

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

const claimAirdropMessage = ({
  sender,
  amount,
  proof
}:{
  sender: string;
  amount: string;
  proof: string[];
}, funds?: Coin[]): MsgExecuteContractEncodeObject => {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: sender,
      contract: AirdropContractAddress,
      msg: toUtf8(JSON.stringify({
        claim: {
          amount,
          proof,
        },
      })),
      funds
    })
  };
}

type Status = "default" | "hasclaim" | "noclaim";

const Home: NextPage = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState('');
  const [status, setStatus] = useState<Status>('default');
  const [merkle, setMerkle] = useState<string[]>([]);
  const [amount, setAmount] = useState<string>("");

  // Airdrop contract address on nois-testnet-005 is nois19kfv6wdsmudx58a2hsktvegvtuyc4rakpsfsxqgmzg26p8ph4yrsteche4
  const checkAirdrop = async (address: string) => {

    setLoading(true);
    toast.loading("Checking address...");
    const res = await fetch('https://gist.githubusercontent.com/kaisbaccour/15a037e706c1bd50acc80fe0a89a72e3/raw/51bd2278f00fe9ccef03b6becc0f68aa42a6e390/snapshot_nois_test_005_list.json');
    const data = await res.json();

    const airdrop = new Airdrop(data)
    const addressObject = data.find(obj => obj.address === address);

    setTimeout(() => {
      if (!addressObject) {
        setLoading(false);
        toast.dismiss();
        setStatus('noclaim');
        toast.error("No Airdrop available");
      } else {
        setLoading(false);
        toast.dismiss();
        setStatus('hasclaim');
        sprayConfetti(Date.now() + 1500)
        const amountx = String(addressObject.amount);
        setAmount(amountx);
        const proof = airdrop.getMerkleProof({
            address: address,
            amount: amountx
        });
        setMerkle(proof);
      };
    }, 2000);
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
    <div className="flex min-h-screen text-nois-white/90 h-screen flex-col py-2 bg-nois-blue">
      <Head>
        <title>Nois Rand-drop Checker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="grid grid-rows-6 items-start w-full h-full">

        {/* Connect wallet header */}
        <div className="row-span-1 bg-nois-blue flex pr-12 pl-0 justify-between items-center">
          <div className="relative flex overflow-hidden">
            <Image
              src={noisLogo}
              alt="Nois"
              unoptimized
              className="scale-50"
              style={{objectFit: 'contain'}}
            />
          </div>
          <button 
            className="border border-white/30 text-nois-white hover:bg-white/20 rounded-lg h-1/2 px-4 py-2"
            onClick={() => handleConnect()}
          >
            {walletAddress.length < 3 ? "Connect" : nickname}
          </button>
        </div>


        {/* Center component */}
        <div className="row-span-5 pt-20 flex flex-col gap-y-4 justify-center  items-center bg-nois-blue">
          <div className="text-4xl font-mono pb-4 pt-0">
            Rand-drop Checker
          </div>
          <input 
                className="w-1/3 px-3 py-2 outline-none rounded-lg placeholder-white/50 bg-slate-500/10 border border-nois-white/30 focus:bg-slate-500/20 focus:border-nois-white/60" 
                placeholder='nois1...' 
                onChange={e => setUserAddress(e.target.value)}
          />
          <div className="flex justify-center gap-x-4 font-mono text-xl ">
            <button 
              className={`${loading === true ? "opacity-50" : "hover:bg-white/20"} px-4 py-1 rounded-lg border border-white/30 text-nois-white`}
              onClick={() => {
                if (loading !== true) {
                  checkAirdrop(userAddress);
                }
              }}
            >
              <span className={`${loading === true ? "animate-ping" : ""}`}>
                {loading === true ? "..." : "Check"}
              </span>
            </button>
            <button 
              className={`${loading === true ? "opacity-50" : "hover:bg-white/20"} px-4 py-1 rounded-lg border border-white/30 text-nois-white`}
              onClick={() => {
                if (loading !== true) {
                  claimAirdrop();
                }
              }}
            >
              <span className={`${loading === true ? "animate-ping" : ""}`}>
                {loading === true ? "..." : "Claim"}
              </span>
            </button>
          </div>



          <div className={`${status === 'default' || loading === true ? 'hidden' : ''} flex gap-x-2 p-2 text-xl rounded-lg bg-[#ffffff10]`}>
            {status === 'hasclaim' && (
              <>
                <span className="text-white/40">
                  Congrats!
                </span>
                <span className="text-nois-white">
                  {`${parseInt(amount) / 1000000} NOIS`}
                </span>
              </>
            )}
            {status === 'noclaim' && (
              <>
               <span className='text-white/40'>
                  Not eligible 
               </span>
              </>
            )}
          </div>

        </div>

      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t border-black">
        <a
          className="flex items-center justify-center gap-2 link link-hover"
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
