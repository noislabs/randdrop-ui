import { ChainType, CheckResponse } from "../pages/api/check";

// Not a hook but seems like a good place to put this
export const fetchUserStatus = async ({
  walletAddr,
  chain,
}: {
  walletAddr: string;
  chain: string;
}) => {
  console.log(`Fetching for ${chain}`);

  try {
    const validateChain = ChainType.safeParse(chain);
    if (!validateChain.success) {
      throw new Error("Invalid chain");
    }

    const queryParams = new URLSearchParams({
      address: walletAddr,
      chain: validateChain.data,
    }).toString();

    const res = await fetch(`/api/check?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const resData = await res.json();

    if (res.status !== 200) {
      throw new Error(JSON.stringify(resData));
    }
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
