import { getInjectiveAddress } from "@injectivelabs/sdk-ts";
import { ChainType, CheckResponse } from "../services/apiHelpers";

// Not a hook but seems like a good place to put this
export const fetchUserStatus = async ({
  walletAddr,
  chain,
}: {
  walletAddr: string;
  chain: string;
}) => {
  console.log(`Fetching for ${chain}`);

  // check if input address start with 0x
  if (walletAddr.startsWith("0x")) {
    walletAddr = getInjectiveAddress(walletAddr);
  }

  try {
    const validateChain = ChainType.safeParse(chain);
    if (!validateChain.success) {
      throw new Error("Invalid chain");
    }

    const queryParams = new URLSearchParams({
      chain: validateChain.data,
      address: walletAddr,
    }).toString();

    const res = await fetch(`https://randdrop-api.nois.network:443/api/check_user?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log(res);
      throw new Error(`Got non-2xx status in API call: ${res.status}`);
    }

    const resData = await res.json();
    const vres = CheckResponse.safeParse(resData);
    if (!vres.success) {
      throw new Error("Invalid response from server");
    }
    return vres.data;
  } catch (e) {
    console.log(e);
    throw new Error(`${e}`);
  }
};
