import Head from "next/head";
import {noisMainnet,noisTestnet} from "@/lib/noisConfig";
import {Airdrop} from "@/lib/airdrop";
import {useState} from "react";
import {Button,VStack,useToast,Text,Heading,SimpleGrid,Box,Container,Link} from "@chakra-ui/react";
import {FaCheck,FaPlus,FaUserShield} from "react-icons/fa";
import {ErrorAlert,ErrorData} from "@/lib/ErrorAlert";
import { CloseIcon } from "@chakra-ui/icons";

function capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Home() {
    const [lastAddChainError, setAddChainError] = useState < ErrorData > ();
    const [loadAddressError, setLoadAddressError] = useState < ErrorData > ();
    const [testnetInstalled, setTestnetInstalled] = useState < boolean > ();
    const [mainnetInstalled, setMainnetInstalled] = useState < boolean > ();
    const [address, setAddress] = useState < string > ();
    const [msg, setMsg] = useState < Object > ();
    const toast = useToast();

    function resetErrors() {
        toast.closeAll();
        setAddChainError(undefined);
        setLoadAddressError(undefined);
    }
    function resetAll() {
      resetErrors();
      setAddress(undefined);
    }

    function addNoisAsSuggestedChain(network: "testnet" | "mainnet") {
        resetErrors();

        const config = network === "testnet" ? noisTestnet : noisMainnet;

        const anyWindow: any = window;
        if (!anyWindow.keplr) {
            setAddChainError({
                title: "Keplr not found",
                description: "It seems like Keplr is not installed.",
            });
        } else {
            anyWindow.keplr.experimentalSuggestChain(config).then(
                () => {
                    console.log("Suggested chain installed");
                    if (network === "testnet") {
                        setTestnetInstalled(true);
                    } else {
                        setMainnetInstalled(true);
                    }
                    toast({
                        title: "Installed",
                        description: `Nois ${capitalizeFirstLetter(network)} installed in Keplr.`,
                        status: "success",
                        duration: 2_000,
                        isClosable: true,
                        id: Date.now(),
                    });
                },
                (err: any) => {
                    console.error(err);
                    setAddChainError({
                        title: "Suggested chain could not be added",
                        description: err.toString(),
                    });
                },
            );
        }
    }

    function checkAirdrop(address: string) {
      // Airdrop contract address on nois-testnet-005 is nois19kfv6wdsmudx58a2hsktvegvtuyc4rakpsfsxqgmzg26p8ph4yrsteche4
        return fetch('https://gist.githubusercontent.com/kaisbaccour/15a037e706c1bd50acc80fe0a89a72e3/raw/bbd96bdfb828b0aa5a5fffcdbdbbc32f2cf17cf2/snapshot_nois_test_005_list.json')
            .then(response => response.json())
            .then(data => {
                const airdrop = new Airdrop(data)
                const addressObject = data.find(obj => obj.address === address)


                if (addressObject) {
                    let amount = addressObject.amount
                    const proof = airdrop.getMerkleProof({
                        address: address,
                        amount: amount
                    })
                    toast({
                        title: "Eligible for airdrop",
                        description: "You can claim your airdrop",
                        status: "success",
                        duration: 2_000,
                        isClosable: true,
                    });

                    let msg = {
                        proof: proof,
                        address: address,
                        amount: amount,
                        eligible: true,
                    }
                    console.log(msg)

                    return msg
                } else {
                    console.log(`Address ${address} not found in the data`)
                    toast({
                        title: "not eligible for airdrop",
                        description: "",
                        status: "warning",
                        duration: 1_000,
                        isClosable: true,
                    });
                    let msg = {
                        proof: [""],
                        address: address,
                        amount: 0,
                        eligible: false,
                    }
                    console.log(msg)

                    return msg
                }
            })
    }

    function loadAddressFromKeplr(network: "testnet" | "mainnet") {
        resetErrors();
        setAddress(undefined);

        const config = network === "testnet" ? noisTestnet : noisMainnet;

        const anyWindow: any = window;
        if (!anyWindow.keplr) {
            setLoadAddressError({
                title: "Keplr not found",
                description: "It seems like Keplr is not installed.",
            });
        } else {
            const keplr = anyWindow.keplr;
            keplr.enable(config.chainId).then(
                () => {
                    console.log("Chain enabled");

                    const offlineSigner = keplr.getOfflineSigner(config.chainId);
                    offlineSigner.getAccounts().then(
                        (accounts: any) => {
                            console.log("Accounts:", accounts);
                            const address = accounts[0].address;
                            if (typeof address !== "string")
                                throw new Error("First account must have a string address");
                            setAddress(address);
                            checkAirdrop(address).then(response => response)
                                .then(data => {
                                    console.log(data);
                                    setMsg(data);
                                })
                                .catch(error => {
                                    console.error(error);
                                });

                            toast({
                                title: "Loaded",
                                description: "Got account address from Keplr.",
                                status: "success",
                                duration: 2_000,
                                isClosable: true,
                            });

                        },
                        (err: any) => {
                            console.error(err);
                            setLoadAddressError({
                                title: "Account unavailable",
                                description: "Could not get account from Keplr.",
                            });
                        },
                    );
                },
                (err: any) => {
                    console.error(err);
                    setLoadAddressError({
                        title: "Keplr unavailable",
                        description: "Could not enable Keplr with the given chain ID.",
                    });
                },
            );
        }
    }

    return (
      <>
      <input type="text" onChange={(e) => checkAirdrop(e.target.value)} />
        <Head>
          <title>Nois Address Generator</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Container maxW="800px" marginTop="40px">
          <SimpleGrid minChildWidth="300px" spacing="40px">
            <Box>
              <VStack spacing={4} align="flex-start">
                <Heading>Nois Randdrop</Heading>
                <Heading size="sm">Step 1</Heading>
                <Text>
                  Install the{" "}
                  <Link href="https://www.keplr.app/download" isExternal>
                    Keplr browser extension
                  </Link>{" "}
                  and follow the instructions to create an account.
                </Text>
                <Heading size="sm">Step 2</Heading>
                <Text>
                  <Button
                    leftIcon={testnetInstalled ? <FaCheck /> : <FaPlus />}
                    isDisabled={true /* Currently no Testnet available */ || testnetInstalled}
                    colorScheme="blue"
                    variant="solid"
                    size="sm"
                    onClick={() => addNoisAsSuggestedChain("testnet")}
                  >
                    {testnetInstalled ? <>Added</> : <>Add Nois Testnet to Keplr</>}
                  </Button>{" "}
                  or
                </Text>
                <Button
                  leftIcon={mainnetInstalled ? <FaCheck /> : <FaPlus />}
                  isDisabled={mainnetInstalled}
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  onClick={() => addNoisAsSuggestedChain("mainnet")}
                >
                  {mainnetInstalled ? <>Added</> : <>Add Nois Mainnet to Keplr</>}
                </Button>
                {lastAddChainError && <ErrorAlert error={lastAddChainError} />}
                <Heading size="sm">Step 3</Heading>
                <Text>Ensure you selected to right account in Keplr. Then:</Text>
                <Text>
                  <Button
                    leftIcon={<FaUserShield />}
                    colorScheme="blue"
                    variant="solid"
                    size="sm"
                    isDisabled={true /* Currently no Testnet available */}
                    onClick={() => loadAddressFromKeplr("testnet")}
                  >
                    Load address (Testnet)
                  </Button>{" "}
                  or
                </Text>
                <Button
                  leftIcon={<FaUserShield />}
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  onClick={() => loadAddressFromKeplr("mainnet")}
                >
                  Load address (Mainnet)
                </Button>
                {loadAddressError && <ErrorAlert error={loadAddressError} />}
              </VStack>
            </Box>
          </SimpleGrid>

          {msg && (
               <>
                 <Text>Address: {msg.address}</Text>
                 <Text>Amount: {msg.amount}</Text>
                 <Text>Eligible: {msg.eligible ? "Yes" : "No"}</Text>
                 <Text>Proof: {msg.proof.join(", ")}</Text>
               </>
             )
          }


          {address && (
          <Text marginTop="100px" fontSize="2xl" align="center">
            {address}{" "}
            <Button size="sm" onClick={() => resetAll()} title="Reset">
              <CloseIcon />
            </Button>
          </Text>
        )}
        </Container>
      </>
    );
}


