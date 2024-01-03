import '../styles/globals.css'
import type { AppProps } from 'next/app'
//import { MultiClientProvider, WalletSelectProvider } from "../contexts/cosmwasm";
import { 
  //WalletSelectProvider, 
  MultiClientProvider 
} from '../contexts/userClients';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import "antd/dist/reset.css"

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            // 30 secs
            staleTime: 30_000,
            retryDelay: 4000,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
        <MultiClientProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                maxWidth: 500,
              },
              success: {
                duration: 6500,
                iconTheme: {
                  primary: "#0e3b00",
                  secondary: "#39FF00",
                },
                style: {
                  border: "1px solid #39FF0060",
                  padding: "16px",
                  color: "#39FF00",
                  background: "#000",
                  textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
                },
              },
              error: {
                duration: 6500,
                iconTheme: {
                  primary: "#300000",
                  secondary: "#FF0000",
                },
                style: {
                  border: "1px solid #FF000060",
                  padding: "16px",
                  color: "#FF0000",
                  background: "#000",
                  textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#424d0000",
                  secondary: "#ddff00",
                },
                style: {
                  border: "1px solid #ddff0060",
                  padding: "16px",
                  color: "#ddff00",
                  background: "#000",
                  textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
                },
              },
            }}
          />
          <Component {...pageProps} />
        </MultiClientProvider>
    </QueryClientProvider>
  )
}

export default MyApp
