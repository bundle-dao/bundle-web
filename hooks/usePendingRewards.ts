import { BigNumberish } from '@ethersproject/bignumber';
import useSWR from 'swr';
import { parseBalance } from '../util';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getPendingBalance(minter: Contract) {
    return async (address: any, pid: string, _: any) => {
        return minter.pendingRewards(pid, address).then((amount: BigNumberish) => parseBalance(amount));
    };
}

export default function usePendingBalance(minter: Contract | undefined, pid: string, suspense = false) {
    const { account } = useWeb3React();

    const shouldFetch = typeof account === 'string' && !!minter;

    const result = useSWR(shouldFetch ? [account, pid, 'PendingBalance'] : null, getPendingBalance(minter!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
