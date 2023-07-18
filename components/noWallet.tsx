import DotLoader from "./dotLoader";


export const WalletNotConnected = ({
  handleConnectAll,
  walletLoading
}:{
  handleConnectAll: () => void;
  walletLoading: boolean;
}) => {
  
  return (
    <div className="flex flex-col p-4 justify-around h-full w-full items-center">
      <span className="flex items-center text-2xl lg:text-3xl text-nois-white h-1/5">
        {'Welcome to the NoisRNG Randdrop!'}
      </span>
      <div className="flex justify-center items-start w-full h-4/5 py-14">
        <div className="flex justify-center items-center gap-x-2">
          <button
            className={`flex justify-center items-center w-[30vw] md:w-[20vw] lg:w-[11vw] h-[7.5vh] rounded-xl px-4 py-2 border border-nois-white/30 text-nois-white/80 hover:text-nois-white hover:bg-gray-700/30`}
            onClick={() => walletLoading ? {} : handleConnectAll()}
          >
            {walletLoading ? (
              <DotLoader />
            ) : (
              <span className="w-full overflow-hidden overflow-ellipsis">
                Connect Wallet
              </span>
            )}
          </button>
          <div className="">
            {`to see if you're eligible for some $NOIS tokens!`}
          </div>
        </div>
      </div>
    </div>
  )
}