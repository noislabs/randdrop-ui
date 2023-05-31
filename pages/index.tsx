import type { NextPage } from 'next'
import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
// import { useSigningClient } from '../contexts/cosmwasm'
import { useKeplr } from '../hooks/useKeplr'
import { WasmExtension } from "@cosmjs/cosmwasm-stargate";
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import noisLogo from '../public/nois_logo.png';
import { QueryClient } from '@cosmjs/stargate';
import { getBatchClient } from '../hooks/cosmwasm';
import { checkEligibleAmount, claimAirdrop, fullCheck, getRanddropAddr } from '../util/msg';
import { fromMicro, validateAddress } from '../util/addressConversion';
import { ChainSelector } from '../components/chainSelector';
import { ChainSelectContext } from '../contexts/chainSelect';
import { sprayConfetti } from '../components/confetti';
import { ClaimingWindowTimer } from '../components/timer';

const routeNewTab = () => {
  window.open(`https://twitter.com/NoisRNG`, "_blank", "noopener noreferrer");
}

// Set to time claiming window opens, in milliseconds
const ClaimWindowOpenTime: number = 1_685_500_001_000

const Home: NextPage = () => {

  // Generic Loading State
  const [loading, setLoading] = useState<boolean>(false);

  // The current chain the user has selected
  const { currentChain } = useContext(ChainSelectContext);
  // Setting up Batch Client because who doesn't use Batch Clients these days
  const [batchClient, setBatchClient] = useState<QueryClient & WasmExtension | undefined>(undefined);

  // Merkle Proof
  const [merkle, setMerkle] = useState<string[] | undefined>();

  // Selected Chain Airdrop amount for user, undefined by default
  const [selectedChainAirdropAmount, setSelectedChainAirdropAmount] = useState<string | undefined>(undefined);

  // Input address inside text field
  const [inputAddress, setInputAddress] = useState("");

  // Any time the selected Chain changes, reset
  useEffect(() => {
    setInputAddress("");
    setSelectedChainAirdropAmount(undefined);
    setMerkle(undefined);
    setLoading(true);
    getBatchClient(currentChain).then((c) => {
      setBatchClient(c);
      setLoading(false);
    }).catch((e) => {
      console.log(e);
      setLoading(false);
    });
  }, [currentChain]);


  // walletAddress + signingClient are updated automatically via React Context
  // whenever SelectedChain is changed
  const { walletAddress, signingClient, nickname, handleConnect } = useKeplr();

  // When walletAddress changes, if it's < 3 (meaning wallet has been connected,
  // we set userInput to the walletAddress to autopopulate the text field,
  // and reset claimable amount
  useEffect(() => {
    if (walletAddress.length > 3) {
      setInputAddress(walletAddress);
    };
    setSelectedChainAirdropAmount(undefined);
  }, [walletAddress])


  const handleCheck = (dateNow: number) => {
    if (loading === true) {
      return;
    }
    // If input address invalid, error and return
    const valid = validateAddress(inputAddress);
    if (!valid) {
      toast.error("Error: Invalid address");
      return;
    }

    if (!batchClient) {
      toast.error("No query client, try again in a few seconds");
      return;
    }

    // if ClaimingWindowOpen is false, query Gist for selected chain
    // if ClaimingWindowOpen is true, query contracts for selected chain
    toast.loading("Processing check...");
    setLoading(true);

    if (ClaimWindowOpenTime < dateNow) {
      fullCheck({
        walletAddress: valid,
        batchClient,
        chain: currentChain,
        airdropContract: getRanddropAddr(currentChain)
        //airdropContract, currently default to juno testnet
      }).then((v) => {
        setLoading(false);
        if (!v) {
          setSelectedChainAirdropAmount(undefined);
          setMerkle(undefined);
        } else {
          sprayConfetti(Date.now() + 1500);
          const userAmt = Number(v.amount) * 3;
          setSelectedChainAirdropAmount(userAmt.toString());
          setMerkle(v.proof);
        };
      }).catch((e) => {
        toast.dismiss();
        setLoading(false);
        setSelectedChainAirdropAmount(undefined);
        setMerkle(undefined);
        toast.error("Error Checking Eligibility, please try again later");
      });
    } else {
      checkEligibleAmount({
        walletAddress: valid,
        chain: currentChain
      }).then((v) => {
        setLoading(false);
        if (!v) {
          setSelectedChainAirdropAmount(undefined);
          setMerkle(undefined);
        } else {
          sprayConfetti(Date.now() + 1500);
          const userAmt = Number(v.amount) * 3;
          setSelectedChainAirdropAmount(userAmt.toString());
          setMerkle(v.proof);
        };
      }).catch((e) => {
        toast.dismiss();
        setLoading(false);
        setSelectedChainAirdropAmount(undefined);
        setMerkle(undefined);
        toast.error("Error Checking Eligibility, please try again later");
      });
    };
  }

  const handleClaim = (dateNow: number) => {
    if (ClaimWindowOpenTime < dateNow) {
      toast.error("Claim window not yet open");
      return;
    }

    if (!batchClient) {
      toast.error("Setting up client, try again in a few seconds");
      return;
    }

    if (!signingClient || walletAddress.length < 3) {
      toast.error("Wallet not connected");
      return;
    }

    if (!selectedChainAirdropAmount || !merkle) {
      toast.error("Please click 'Check' before trying to Claim");
      return;
    }
    setLoading(true);
    toast.loading("Processing claim");

    claimAirdrop({
      walletAddress,
      amount: selectedChainAirdropAmount,
      proof: merkle,
      batchClient,
      signingClient,
      //airdropContract, defaults to Juno Testnet
      airdropContract: getRanddropAddr(currentChain)
    }).then((v) => {
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        toast.dismiss();
        toast.error("Problem claiming Randdrop, please try again later");
      });
  }


  return (
    <div className="flex min-h-screen text-nois-white/90 h-screen flex-col p-2 bg-gradient-to-br from-nois-blue to-black ">
      <Head>
        <title>Nois Rand-drop Checker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col justify-start items-center w-full h-full">

        {/* Connect wallet header */}
        <div className="flex justify-between h-[15vh] px-12 w-full border-b border-nois-white/10 ">
          <div
            onClick={() => routeNewTab()}
            className="relative flex overflow-hidden hover:cursor-pointer ">
            <Image
              src={noisLogo}
              alt="Nois"
              //unoptimized
              className="scale-75"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex flex-col gap-y-1 justify-center items-center">
            <span className="text-nois-white/60 text-base">
              {"Juno testnet claims available in:"}
            </span>
            <ClaimingWindowTimer dateNow={Date.now()} endTimer={ClaimWindowOpenTime} />
          </div>
          <div className="h-full flex justify-center items-center gap-x-4 pr-8">
            <ChainSelector/>
            <button
              className={`${walletAddress.length < 3 && "shadow-neon-md animate-pulse"} border border-nois-green/80 text-nois-green/80 hover:bg-nois-green/30 rounded-lg px-4 py-2`}
              onClick={() => handleConnect()}
            >
              {walletAddress.length < 3 ? "Connect" : nickname}
            </button>
          </div>
        </div>

        {/* Center component */}
        <div className="w-full flex h-[70vh] flex-col gap-y-8 justify-center items-center bgx-nois-blue">
          <div className="flex gap-x-4 w-2/5 justify-center items-center">
            <input
              className="w-full px-3 py-2 outline-none rounded-lg placeholder-white/50 bg-slate-500/10 border border-nois-white/30 focus:bg-slate-500/20 focus:border-nois-white/60"
              placeholder={`${currentChain}1...`}
              onChange={(e) => setInputAddress(e.target.value)}
              value={inputAddress}
            />
          </div>
          <div className="flex flex-col gap-y-2 w-2/5 justify-center items-center borderx">
            <div className="p-2 flex w-full justify-start gap-x-4 text-nois-white/90 border border-nois-white/20 bg-slate-600/10">
              <span className="text-nois-white/30">
                {`${currentChain.slice(0, 1).toUpperCase() + currentChain.slice(1)}:`}
              </span>
              {inputAddress.length > 3 ?
                inputAddress :
                <div className="text-nois-white/50">Connect wallet or Enter address above</div>
              }
            </div>
            <div className={`${selectedChainAirdropAmount ? "text-green-500" : "hidden"} text-sm w-full flex justify-center`}>
              {ClaimWindowOpenTime < Date.now() ? (
                <span>
                  {selectedChainAirdropAmount && `Claimable Amount: ${fromMicro(selectedChainAirdropAmount)} $NOIS`}
                </span>
              ):(
                <span>
                  {selectedChainAirdropAmount && `Eligible for: ${fromMicro(selectedChainAirdropAmount)} $NOIS`}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-x-4 text-xl ">
            <button
              className={`${loading === true ? "opacity-50" : "hover:bg-white/20"} px-4 py-2 rounded-lg border border-white/30 text-nois-white`}
              onClick={() => handleCheck(Date.now())}
            >
              <span className={`${loading === true ? "animate-ping" : ""}`}>
                {loading === true ? "..." : "Check"}
              </span>
            </button>
            <button
              className={`${(currentChain !== "juno" || !merkle || walletAddress.length < 3 || !selectedChainAirdropAmount || walletAddress !== inputAddress || loading === true) ? "opacity-50 hover:cursor-default hover:bg-transparent" : "hover:bg-white/20"} px-4 py-2 rounded-lg border border-white/30 text-nois-white`}
              onClick={() => handleClaim(Date.now())}
            >
              <span className={`${loading === true && "animate-ping"}`}>
                {loading === true ? "..." : "Claim"}
              </span>
            </button>
          </div>
        </div>
      </main>

      <footer className="flex h-[15vh] w-full items-center justify-center">
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
