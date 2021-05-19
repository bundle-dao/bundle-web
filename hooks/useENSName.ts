import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";

export default function useENSName(address: string | null | undefined) {
  const { library, chainId } = useWeb3React();
  const [ENSName, setENSName] = useState("");

  useEffect(() => {
    if (library && typeof address === "string") {
      let stale = false;

      library
        .lookupAddress(address)
        .then((name: string) => {
          if (!stale && typeof name === "string") {
            setENSName(name);
          }
        })
        .catch(() => {});

      return () => {
        stale = true;
        setENSName("");
      };
    }
  }, [library, address, chainId]);

  return ENSName;
}
