import { useContext, useState } from "react";
import { ChainSelectContext, availableChain } from "../contexts/chainSelect";
import { toast } from "react-hot-toast";
import { useKeplr } from "../hooks/useKeplr";

export const ChainSelector = ({
  current,
  cb,
  width,
  py,
}:{
  current?: string;
  cb?: (val: availableChain) => void;
  width?: string;
  py?: string;
}) => {
  const { currentChain, changeChain } = useContext(ChainSelectContext);
  const [isOpen, setIsOpen] = useState(false);
  const { disconnect } = useKeplr();

  const handleDropdownChange = (event) => {
    event.preventDefault();
    disconnect();
    const selectedChain = event.target.value;
    cb ? cb(selectedChain) : changeChain(selectedChain)
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${width ?? "w-[8vw]"} inline-block text-left`}>
      <div>
        <button
          onClick={() => toggleDropdown()}
          type="button" 
          className={`inline-flex w-full justify-between gap-x-1.5 rounded-md bg-black text-nois-white hover:shadow-neon-sm px-3 ${py ?? "py-2"} text-sm shadow-sm ring-1 ring-inset ring-nois-green/40 hover:ring-nois-green hover:bg-black`} 
          id="menu-button" 
          aria-expanded="true" 
          aria-haspopup="true"
        >
          {`${current ? current.charAt(0).toUpperCase() + current.slice(1) : currentChain.charAt(0).toUpperCase() + currentChain.slice(1)}`}
          <svg className={`${isOpen && "rotate-180 text-nois-white"} transition duration-300 ease-in-out -mr-1 h-5 w-5 text-nois-white/70`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div
        className={`${!isOpen && "hidden"} transition-transform ease-in-out duration-1000 absolute right-0 z-10 mt-2 w-[12vw] p-1 origin-top-right rounded-md bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`} 
        role="menu" 
        aria-orientation="vertical" 
        aria-labelledby="menu-button"
      >
        <div className="py-1" role="none">
          <button 
            onClick={(e) => handleDropdownChange(e)} 
            className="text-gray-100 hover:bg-nois-green/20 block px-4 py-2 text-sm w-full text-left rounded-md" 
            value="juno"
          >
            Juno
          </button>
          <button 
            onClick={(e) => handleDropdownChange(e)}
            className="text-gray-100 hover:bg-nois-green/20 block px-4 py-2 text-sm w-full text-left rounded-md" 
            //onClick={() => toast.error("Coming soon")} 
            // className="text-gray-500 hover:cursor-not-allowed  block px-4 py-2 text-sm w-full text-left rounded-md" 
            value="injective"
          >
            Injective
          </button>
          <button 
            onClick={(e) => handleDropdownChange(e)}
            className="text-gray-100 hover:bg-nois-green/20 block px-4 py-2 text-sm w-full text-left rounded-md" 
            // onClick={() => toast.error("Coming soon")}  
            // className="text-gray-500 hover:cursor-not-allowed block px-4 py-2 text-sm w-full text-left rounded-md" 
            value="stargaze"
          >
            Stargaze
          </button>
          <button 
            onClick={(e) => handleDropdownChange(e)} 
            className="text-gray-100 hover:bg-nois-green/20 block px-4 py-2 text-sm w-full text-left rounded-md" 
            // onClick={() => toast.error("Coming soon")} 
            // className="text-gray-500 hover:cursor-not-allowed block px-4 py-2 text-sm w-full text-left rounded-md" 
            value="aura"
          >
            Aura
          </button>
        </div>
      </div>
    </div>
  )
};