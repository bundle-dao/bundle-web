import useSWR from 'swr';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getPendingBalances(tokens: Contract[]) {
    return async (address: any, _: any) => {
        return Promise.all(tokens.map(async (token) => await token.balanceOf(address)));
    };
}

export default function useRawBalances(tokens: Contract[] | undefined, suspense = false) {
    const { account } = useWeb3React();
    const shouldFetch = typeof account === 'string' && !!tokens;

    const result = useSWR(shouldFetch ? [account, 'UnstakedBalance', tokens] : null, getPendingBalances(tokens!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
