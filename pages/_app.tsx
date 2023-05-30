import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SigningCosmWasmProvider } from "../contexts/cosmwasm";
import { Toaster } from 'react-hot-toast';
import { ChainSelectProvider } from '../contexts/chainSelect';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            // 5 mins
            staleTime: 300000,
            retryDelay: 4000,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ChainSelectProvider>
        <SigningCosmWasmProvider>
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
                  background: `linear-gradient(to bottom right, rgba(57, 255, 0, 0.1), rgba(57, 255, 0, 0.01))`,
                  backdropFilter:
                    "blur(1px) brightness(20%) saturate(150%)",
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
                  background: `linear-gradient(to bottom right, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.01))`,
                  backdropFilter:
                    "blur(1px) brightness(20%) saturate(150%)",
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
                  background: `linear-gradient(to bottom right, rgba(221, 255, 0, 0.1), rgba(221, 255, 0, 0.01))`,
                  backdropFilter:
                    "blur(1px) brightness(20%) saturate(150%)",
                  textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
                },
              },
            }}
          />
          <Component {...pageProps} />
        </SigningCosmWasmProvider>
      </ChainSelectProvider>
    </QueryClientProvider>
  )
}

export default MyApp
