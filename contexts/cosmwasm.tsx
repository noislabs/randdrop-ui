import { createContext, useContext, ReactNode } from "react";
import {
  UserSigningClientsContext,
  useAllSigningClients,
} from "../hooks/cosmwasm";

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

export const useAllClients = (): UserSigningClientsContext => 
  useContext(AllClientsContext);

export const MultiClientProvider = ({
  children
}:{
  children: ReactNode;
}) => {
  const value = useAllSigningClients();
  return <ClientsProvider value={value}>{children}</ClientsProvider>
}