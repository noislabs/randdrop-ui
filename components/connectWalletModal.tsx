// import { useState } from "react";
import React, { useState, useRef, useEffect, useContext, useMemo, useCallback } from 'react';
//import WALLETCONNECT_LOGO from "../public/WALLETCONNECT_LOGO.png";
import LEDGER_LOGO from "../public/LEDGER_LOGO.jpg";
import KEPLR_LOGO from "../public/KEPLR_LOGO.png";
import LEAP_LOGO from "../public/LEAP_LOGO.png";
import METAMASK_LOGO from "../public/METAMASK_LOGO.png";
import NextImage from "next/image";
import { 
  useAllMultiClients 
} from '../contexts/userClients';
import { WalletType } from '../contexts/userClients';
import { toast } from 'react-hot-toast';
import DotLoader from './dotLoader';

export const WalletConnectModal = () => {

  const {
    walletType,
    changeWalletType,
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

  const [checked, setChecked] = useState<WalletType | undefined>();

  const handleCheck = (val: WalletType) => {
    if (checked === val) {
      changeWalletType("");
      setChecked(undefined);
    } else {
      changeWalletType(val);
      setChecked(val);
    }
  }

  const handleConnectWallet = () => {
    if (!checked || walletType === "") {
      toast.error("Select a wallet type before connecting")
    } else {
      handleConnectAll();
      handleCloseModal();
    }
  }

  const handleOpenModal = () => {
    setIsOpen(true);
    setChecked(undefined);
  }

  const handleCloseModal = () => {
    setIsOpen(false);
    setChecked(undefined);
  }

  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button 
        onClick={() => {
          if (!walletLoading && walletIsConnected) {
            disconnectAll();
          } else if (!walletLoading && !walletIsConnected) {
            handleOpenModal();
          }
        }}
        className="flex justify-center items-center w-[30vw] md:w-[20vw] lg:w-[11vw] h-[7.5vh] rounded-xl px-4 py-2 border border-nois-light-green/30 text-nois-light-green/80 hover:text-nois-light-green hover:border-nois-light-green hover:bg-black"
      >
        {walletLoading ? (
          <DotLoader/>
        ):(
          <span className="w-full overflow-hidden overflow-ellipsis">
            {walletIsConnected ? "Disconnect" : "Connect Wallet"}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center md:items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div onClick={handleCloseModal} className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"/>
            {/* 0 widdthspace to keep modal centered */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div ref={modalRef} className="inline-block h-[60vh] w-[90vw] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bxg-gray-950 bg-neutral-900 brightness-110 pt-2 pb-2 h-full flex flex-col px-4 pt-5pb-4sm:p-6sm:pb-4">
                <div className="w-full flex justify-between items-center">
                  <div className="text-lg px-1 font-thin text-nois-white/40" id="modal-title">
                    Connect Wallet
                  </div>
                  <svg onClick={handleCloseModal} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="hover:cursor-pointer opacity-50 hover:opacity-100 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="grid grid-rows-3 h-full py-2 gap-y-2">
                  <div
                    onClick={() => handleCheck("keplr")}
                    className={`row-span-1 h-full py-1 flex justify-center md:justify-start rounded-lg hover:cursor-pointer ${checked === "keplr" ? 
                      "bg-black/80 text-nois-light-green" : 
                      "bg-black/20 hover:bg-black/50 text-nois-white/30 hover:text-nois-white/60"}`}
                  >
                    <div className="basis-0 md:basis-1/3 h-full hidden md:flex justify-center p-2">
                      <div className="relative aspect-square">
                        <NextImage
                          src={KEPLR_LOGO}
                          alt={`keplr_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`roundexd-full ${checked !== "keplr" && "saturdate-50 grayscale brightness-[0.3]" }`}
                        />
                      </div>
                    </div>
                    <div className="basis-3/3 md:basis-2/3 flex justify-evenly w-full md:justify-between pr-0 md:pr-8 items-center gap-x-2 text-2xl font-semibold">
                      <span>
                        Keplr Wallet
                      </span>
                      {checked === "keplr" ? <CheckedBox/> : <UncheckedBox/>}
                    </div>
                  </div>
                  <div
                    onClick={() => handleCheck("leap")}
                    className={`row-span-1 h-full py-1 flex justify-center md:justify-start rounded-lg hover:cursor-pointer ${checked === "leap" ? 
                      "bg-black/80 text-nois-light-green" : 
                      "bg-black/20 hover:bg-black/50 text-nois-white/30 hover:text-nois-white/60"}`}
                  >
                    <div className="basis-0 md:basis-1/3 h-full hidden md:flex justify-center p-2">
                      <div className="relative aspect-square">
                        <NextImage
                          src={LEAP_LOGO}
                          alt={`leap_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`${checked !== "leap" && "saturdate-50 grayscale brightness-[0.3]" }`}
                        />
                      </div>
                    </div>
                    <div className="basis-3/3 md:basis-2/3 flex justify-evenly w-full md:justify-between pr-0 md:pr-8 items-center gap-x-2 text-2xl font-semibold">
                      <span>
                        Leap Wallet
                      </span>
                      {checked === "leap" ? <CheckedBox/> : <UncheckedBox/>}
                    </div>
                  </div>
                  <div
                    onClick={() => handleCheck("ledger")}
                    className={`row-span-1 h-full py-1 flex justify-center md:justify-start rounded-lg hover:cursor-pointer ${checked === "ledger" ? 
                      "bg-black/80 text-nois-light-green" : 
                      "bg-black/20 hover:bg-black/50 text-nois-white/30 hover:text-nois-white/60"}`}
                  >
                    <div className="basis-0 md:basis-1/3 h-full hidden md:flex justify-center p-2">
                      <div className="relative aspect-square">
                        <NextImage
                          src={LEDGER_LOGO}
                          alt={`ledger_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`border border-nois-white/50 ${checked !== "ledger" && "saturdate-50 grayscale brightness-[0.3]"}`}
                        />
                      </div>
                    </div>
                    <div className="basis-3/3 md:basis-2/3 flex justify-evenly w-full md:justify-between pr-0 md:pr-8 items-center gap-x-2 text-2xl font-semibold">
                      <span>
                        Ledger USB
                      </span>
                      {checked === "ledger" ? <CheckedBox/> : <UncheckedBox/>}
                    </div>
                  </div>
                  <div
                    onClick={() => handleCheck("metamask")}
                    className={`row-span-1 h-full py-1 flex justify-center md:justify-start rounded-lg hover:cursor-pointer ${checked === "ledger" ? 
                      "bg-black/80 text-nois-light-green" : 
                      "bg-black/20 hover:bg-black/50 text-nois-white/30 hover:text-nois-white/60"}`}
                  >
                    <div className="basis-0 md:basis-1/3 h-full hidden md:flex justify-center p-2">
                      <div className="relative aspect-square">
                        <NextImage
                          src={METAMASK_LOGO}
                          alt={`metamask_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`border border-nois-white/50 ${checked !== "metamask" && "saturdate-50 grayscale brightness-[0.3]"}`}
                        />
                      </div>
                    </div>
                    <div className="basis-3/3 md:basis-2/3 flex justify-evenly w-full md:justify-between pr-0 md:pr-8 items-center gap-x-2 text-2xl font-semibold">
                      <span>
                        Metamask
                      </span>
                      {checked === "metamask" ? <CheckedBox/> : <UncheckedBox/>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center w-full p-2">
                  <button
                    onClick={() => handleConnectWallet()}
                    className={`border rounded-lg py-2 px-8 ${!checked ? 
                      "hover:cursor-not-allowed border-nois-white/10 text-nois-white/40 bg-black/10" : 
                      "hover:cursor-pointer border-nois-light-green text-nois-light-green hover:bg-nois-light-green/10"}`}
                  >
                    {`Connect ${checked ? checked && checked.charAt(0).toUpperCase() + checked.slice(1) : ""}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UncheckedBox = () => {
  return (
    <div className="w-8 h-8 border-2 rounded-lg border-nois-white/40">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      </svg>
    </div>
  )
}

const CheckedBox = () => {
  return (
    <div className="w-8 h-8 border-2 rounded-lg border-transparent bg-nois-light-green bxg-nois-white/50">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
