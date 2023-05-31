import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
//import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { createContext } from "react";

export type availableChain = "uni" | "juno" | "injective" | "stargaze" | "aura";

type ChainSelectContextType = {
  currentChain: availableChain;
  changeChain: (newChain: availableChain) => void;
}

export const ChainSelectContext = createContext<ChainSelectContextType>({
  currentChain: "uni",
  changeChain: (newChain: availableChain) => {}
});

export const ChainSelectProvider = ({ children }:{children: ReactNode}) => {
  const [chain, setChain] = useState<availableChain>("uni");

  const handleChangeChain = (newChain: availableChain) => {
    setChain(newChain);
  }

  return (
    <ChainSelectContext.Provider
      value={{ currentChain: chain, changeChain: handleChangeChain }}
    >
      {children}
    </ChainSelectContext.Provider>
  );
}
