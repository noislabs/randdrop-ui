// import { useState } from "react";
import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import WALLETCONNECT_LOGO from "../public/WALLETCONNECT_LOGO.png";
import LEDGER_LOGO from "../public/LEDGER_LOGO.jpg";
import KEPLR_LOGO from "../public/KEPLR_LOGO.png";
import NextImage from "next/image";
import { WalletSelectContext } from '../contexts/cosmwasm';
import { useMultiWallet, WalletType } from '../hooks/useKeplr';
import { toast } from 'react-hot-toast';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const WalletConnectModal: React.FC = () => {

  const {currentWalletType, changeWalletType} = useContext(WalletSelectContext);

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

  const handleSelectWallet = (neww: WalletType) => {
    // setIsOpen(false);
    toast.success("called select wallet")
    changeWalletType(neww);
    handleConnectAll();
  }

  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button 
        onClick={openModal} 
        className={`flex justify-center items-center w-[30vw] md:w-[20vw] lg:w-[11vw] h-[7.5vh] rounded-xl px-4 py-2 border border-nois-white/30 text-nois-white/80 hover:text-nois-white hover:bg-gray-700/30`}
      >
          Open Modal
      </button>
      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div onClick={closeModal} className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"/>
            {/* 0 widdthspace to keep modal centered */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div ref={modalRef} className="inline-block h-[60vh] alin-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-900 pt-2 pb-2 h-full flex flex-col brightness-150 px-4 pt-5pb-4sm:p-6sm:pb-4">
                <div className="w-full flex justify-between items-center">
                  <div className="text-lg px-1 font-thin text-nois-white/40" id="modal-title">
                    Connect Wallet
                  </div>
                  <svg onClick={closeModal} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="hover:cursor-pointer opacity-50 hover:opacity-100 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="grid grid-rows-3 h-full py-2 gap-y-2">
                  <div
                    onClick={() => handleSelectWallet("keplr")}
                    className="row-span-1 h-full py-1 flex justify-start rounded-lg bg-black/20 hover:bg-black/50 hover:cursor-pointer"
                  >
                    <div className="basis-1/3 h-full flex justify-center p-2">
                      <div className="relative aspect-square ">
                        <NextImage
                          src={KEPLR_LOGO}
                          alt={`keplr_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`roundexd-full`}
                        />
                      </div>
                    </div>
                    <div className="basis-2/3 text-nois-white/50 hover:text-nois-white flex justify-start  items-center text-2xl font-semibold">
                      Keplr Wallet
                    </div>
                  </div>
                  <div
                    onClick={() => handleSelectWallet("leap")}
                    className="row-span-1 h-full py-1 flex justify-start rounded-lg bg-black/20 hover:bg-black/50 hover:cursor-pointer"
                  >
                    <div className="basis-1/3 h-full flex justify-center p-2">
                      <div className="relative aspect-square ">
                        <NextImage
                          src={WALLETCONNECT_LOGO}
                          alt={`wallet_connect_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={`rounded-full ring-nois-white ring-1`}
                        />
                      </div>
                    </div>
                    <div className="basis-2/3 text-nois-white/50 hover:text-nois-white flex justify-start items-center text-2xl font-semibold">
                      LEAP
                    </div>
                  </div>
                  <div
                    onClick={() => {}}
                    className="row-span-1 h-full py-1 flex justify-start rounded-lg bg-black/20 hover:bg-black/50 hover:cursor-pointer"
                  >
                    <div className="basis-1/3 h-full flex justify-center p-2">
                      <div className="relative aspect-square ">
                        <NextImage
                          src={LEDGER_LOGO}
                          alt={`ledger_logo`}
                          unoptimized
                          object-fit="cover"
                          fill={true}
                          className={``}
                        />
                      </div>
                    </div>
                    <div className="basis-2/3 text-nois-white/50 hover:text-nois-white flex justify-start items-center text-2xl font-semibold">
                      Ledger
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// export const WalletConnectModal = () => {

//   const [open, setOpen] = useState<boolean>(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(!open)} 
//         data-modal-target="defaultModal" data-modal-toggle="defaultModal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
//         Toggle modal
//       </button>

//       <div id="defaultModal" aria-hidden="false" className={`fixed top-0 left-0 right-0 z-50 ${!open && "hidden"} w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
//           <div className="relative w-full max-w-2xl max-h-full">
//               <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//                   <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
//                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                           Terms of Service
//                       </h3>
//                       <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="defaultModal">
//                           <span className="sr-only">Close modal</span>
//                       </button>
//                   </div>
//                   <div className="p-6 space-y-6">
//                       <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
//                           dodododo
//                       </p>
//                       <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
//                           dadadada
//                       </p>
//                   </div>
//                   <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
//                       <button data-modal-hide="defaultModal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
//                       <button data-modal-hide="defaultModal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Decline</button>
//                   </div>
//               </div>
//           </div>
//       </div>
//       </>
//   )


//   // return (
//   //   <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
//   //     <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
//   //       <div className="w-full">
//   //         <div className="m-8 my-20 max-w-[400px] mx-auto">
//   //           <div className="mb-8">
//   //             <h1 className="mb-4 text-3xl font-extrabold">Turn on notifications</h1>
//   //             <p className="text-gray-600">Get the most out of Twitter by staying up to date with what's happening.</p>
//   //           </div>
//   //           <div className="space-y-4">
//   //             <button className="p-3 bg-black rounded-full text-white w-full font-semibold">Allow notifications</button>
//   //             <button className="p-3 bg-white border rounded-full w-full font-semibold">Skip for now</button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   </div>
//   // )
// }