import { createContext, useContext, ReactNode, useState } from "react";
import {
  UserSigningClientsContext,
  useAllSigningClients,
  useAllSigningClientsLeap,
} from "../hooks/cosmwasm";
import { WalletType } from "../hooks/useKeplr";


let AllClientsContext: any;
let { Provider: ClientsProvider } = (AllClientsContext = 
  createContext<UserSigningClientsContext>({
    uniClient: undefined,
    junoClient: undefined,
    injectiveClient: undefined,
    stargazeClient: undefined,
    auraClient: undefined,
    loading: false,
    nickname: "",
    connectAll: () => {},
    disconnectAll: () => {}
  }));

// export const useAllClients = (): UserSigningClientsContext => 
//   useContext(AllClientsContext);
export const MultiClientProvider = ({
  children
}:{
  children: ReactNode;
}) => {
  const {currentWalletType, changeWalletType} = useContext(WalletSelectContext);
  

  const value = useAllSigningClientsLeap();
  return <ClientsProvider value={value}>{children}</ClientsProvider>
}

type WalletSelectContextType = {
  currentWalletType: WalletType;
  changeWalletType: (newWallet: WalletType) => void;
}

export const WalletSelectContext = createContext<WalletSelectContextType>({
  currentWalletType: "keplr",
  changeWalletType: (newWallet: WalletType) => {}
});

export const WalletSelectProvider = ({children}:{children: ReactNode}) => {
  const [walletType, setWalletType] = useState<WalletType>("keplr");
  const handleChangeWalletType = (newWallet: WalletType) => {
    setWalletType(newWallet);
  }
  return (
    <WalletSelectContext.Provider
      value={{ currentWalletType: walletType, changeWalletType: handleChangeWalletType }}
    >
      {children}
    </WalletSelectContext.Provider>
  );
}






// let AllClientsContext: any;
// let { Provider: ClientsProvider } = (AllClientsContext = 
//   createContext<UserSigningClientsContext>({
//     uniClient: undefined,
//     junoClient: undefined,
//     injectiveClient: undefined,
//     stargazeClient: undefined,
//     auraClient: undefined,
//     loading: false,
//     nickname: "",
//     connectAll: () => {},
//     disconnectAll: () => {}
//   }));

// export const useAllClients = (): UserSigningClientsContext => 
//   useContext(AllClientsContext);

// export const MultiClientProvider = ({
//   children
// }:{
//   children: ReactNode;
// }) => {
//   const value = useAllSigningClients();
//   return <ClientsProvider value={value}>{children}</ClientsProvider>
// }