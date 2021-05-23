import { BigNumberish } from '@ethersproject/bignumber';
import { useWeb3React } from '@web3-react/core';
import useSWR from 'swr';
import { parseBalance } from '../util';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';

function getETHBalance(library: any) {
    return async (address: any, _: any) => {
        return library.getBalance(address).then((balance: BigNumberish) => parseBalance(balance));
    };
}

export default function useETHBalance(address: any, suspense = false) {
    const { library, chainId } = useWeb3React();

    const shouldFetch = typeof address === 'string' && !!library;

    const result = useSWR(shouldFetch ? [address, chainId, 'ETHBalance'] : null, getETHBalance(library), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
