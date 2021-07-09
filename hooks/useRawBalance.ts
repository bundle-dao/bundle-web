import useSWR from 'swr';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getPendingBalance(token: Contract) {
    return async (address: any, _: any) => {
        return token.balanceOf(address);
    };
}

export default function useRawBalance(token: Contract | undefined, suspense = false) {
    const { account } = useWeb3React();
    const shouldFetch = typeof account === 'string' && !!token;

    const result = useSWR(shouldFetch ? [account, 'UnstakedBalance', token] : null, getPendingBalance(token!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
