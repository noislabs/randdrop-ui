import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DiceLoader from "../components/diceLoader";
import { ChainSigningClient } from "../contexts/userClients";
import { calculatePercentage } from "../hooks/cosmwasm";
import { CheckResponse, getContractAddress } from "../pages/api/check";
import { randdropClaimMsg } from "../services/contractTx";
import { signSendAndBroadcastOnInjective } from "../services/injective";
import { ethLedgerTxHelper } from "../services/ledgerHelpers";
import { routeNewTab } from "../services/misc";
import { Button } from "./button";

const BridgeLinks = {
  injective:
    "https://tfm.com/bridge?chainTo=nois-1&chainFrom=injective-1&token0=ibc%2FDD9182E8E2B13C89D6B4707C7B43E8DB6193F9FF486AFA0E6CF86B427B0D231A&token1=unois",
  juno: "https://tfm.com/bridge?chainTo=nois-1&chainFrom=juno-1&token0=ibc%2F1D9E14A1F00613ED39E4B8A8763A20C9BE5B5EA0198F2FE47EAE43CD91A0137B&token1=unois",
  stargaze:
    "https://tfm.com/bridge?chainTo=nois-1&chainFrom=stargaze-1&token0=ibc%2F0F181D9F5BB18A8496153C1666E934169515592C135E8E9FCCC355889858EAF9&token1=unois",
  aura: "https://tfm.com/bridge?chainTo=nois-1&chainFrom=xstaxy-1&token0=ibc%2F1FD48481DAA1B05575FE6D3E35929264437B8424A73243B207BCB67401C7F1FD&token1=unois",
  osmosis:
    "https://tfm.com/bridge?chainTo=nois-1&chainFrom=osmosis-1&token0=ibc%2F6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90&token1=unois",
};

export const ClaimInfo = ({
  client,
  checkResponse,
  refetch,
}: {
  client: ChainSigningClient | undefined;
  checkResponse: CheckResponse;
  refetch: () => {};
}) => {
  const [claimPercentageLeft, setClaimPercentageLeft] = useState(0);
  const [tokenLeft, setTokenLeft] = useState(0);

  useEffect(() => {
    (async () => {
      // If no client, or client is not metamask or ledger, return
      if (!client || !client.chain) {
        toast.error(
          `Wallet or Ledger not connected for ${checkResponse.chain}`
        );
        return;
      }

      const contractAddress = getContractAddress(client.chain);

      if (contractAddress === "") {
        toast.error(
          `No randdrop contract available for ${checkResponse.chain}`
        );
        return;
      }

      const resp = await calculatePercentage(client?.chain, contractAddress);
      if (!resp) {
        toast.error(
          `Unable to fetch contract balance for ${checkResponse.chain}`
        );
        return;
      }
      setClaimPercentageLeft(parseFloat(resp.percentageLeft.toFixed(2)));
      setTokenLeft(resp.amountLeft);
    })();
  }, [client, checkResponse]);

  const handleClaimRanddrop = useCallback(() => {
    // If no client, or client is not metamask or ledger, return
    if (
      !client ||
      (client.walletType !== "metamask" &&
        !client.ethLedgerClient &&
        !client.signingClient)
    ) {
      toast.error(`Wallet or Ledger not connected for ${checkResponse.chain}`);
      return;
    }

    // Assert claim_contract exists
    if (!checkResponse.claim_contract) {
      toast.error(`No randdrop contract available for ${checkResponse.chain}`);
      return;
    }

    // If walletType is ledger && chain is injective, use helper
    if (client.walletType === "metamask" && client.chain === "injective") {
      toast.loading("Processing your request...");
      signSendAndBroadcastOnInjective({
        client,
        wallet: client.walletType,
        message: {
          wallet: client.walletAddress,
          contract: checkResponse.claim_contract ?? "x",
          amount: checkResponse.amount,
          proof: checkResponse.proof,
        },
      })
        .then((r) => {
          toast.dismiss();
          refetch();
          toast.success(`Dice are rolling!`);
          toast.success(`Check back in a few seconds to view your result`);
        })
        .catch((e) => {
          toast.dismiss();
          toast.error(`Problem submitting transaction`);
          toast.error(`Visit our Discord for assistance`);
        });
    } else if (client.walletType === "ledger" && client.chain === "injective") {
      toast.loading("Processing your request...");
      ethLedgerTxHelper({
        client,
        checkResponse,
      })
        .then((txhash) => {
          toast.dismiss();
          refetch();
          toast.success(`Transaction broadcasted | TxHash: ${txhash}`);
        })
        .catch((e) => {
          toast.dismiss();
          toast.error("Failure broadcasting transaction");
        });
    } else if (client.chain === "injective") {
      // walletType === "keplr" || walletType === "leap"
      toast.loading("Processing your request...");
      signSendAndBroadcastOnInjective({
        client,
        wallet: client.walletType,
        message: {
          wallet: client.walletAddress,
          contract: checkResponse.claim_contract ?? "x",
          amount: checkResponse.amount,
          proof: checkResponse.proof,
        },
      })
        .then((r) => {
          toast.dismiss();
          refetch();
          toast.success(`Dice are rolling!`);
          toast.success(`Check back in a few seconds to view your result`);
        })
        .catch((e) => {
          toast.dismiss();
          toast.error(`Problem submitting transaction`);
          toast.error(`Visit our Discord for assistance`);
        });
    } else if (client.signingClient !== undefined) {
      toast.loading("Processing your request...");
      let msg = randdropClaimMsg({
        wallet: client.walletAddress,
        contract: checkResponse.claim_contract ?? "x",
        amount: checkResponse.amount,
        proof: checkResponse.proof,
      });
      client.signingClient
        .signAndBroadcast(client.walletAddress, [msg], "auto")
        .then((r) => {
          toast.dismiss();
          refetch();
          toast.success(`Dice are rolling!`);
          toast.success(`Check back in a few seconds to view your result`);
        })
        .catch((e) => {
          toast.dismiss();
          toast.error(`Problem submitting transaction`);
          toast.error(`Visit our Discord for assistance`);
        });
    }
  }, [client?.walletAddress]);

  if (!client || checkResponse.userStatus === "not_eligible") {
    return null;
  } else {
    switch (checkResponse.userStatus) {
      case "ready": {
        return (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {(tokenLeft > 20_000_000 || claimPercentageLeft !== 0) && (
                <Button
                  onClick={() => handleClaimRanddrop()}
                  text={"Roll the dice"}
                />
              )}
            </div>
          </div>
        );
      }
      case "already_won": {
        return (
          <div className={`flex flex-col justify-start gap-y-2 items-center`}>
            <div className=" flex flex-col gap-y-1">
              <Button
                onClick={() => {
                  let link = BridgeLinks[checkResponse.chain];
                  routeNewTab(link);
                }}
                text={"Transfer to Nois Chain"}
              />
              <Button
                onClick={() => routeNewTab("https://pod.kujira.network/nois-1")}
                text={"Stake on Nois Chain"}
              />
            </div>
          </div>
        );
      }
      case "already_lost": {
        return null;
      }
      case "waiting_randomness": {
        return <DiceLoader chain={checkResponse.chain} />;
      }
      default: {
        return null;
      }
    }
  }
};
