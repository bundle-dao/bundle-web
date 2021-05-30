import useSWR from 'swr';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getStakedBalance(minter: Contract) {
    return async (address: any, pid: string, _: any) => {
        return minter.userInfo(pid, address).then((data: any) => data.amount);
    };
}

export default function useStakedBalance(minter: Contract | undefined, pid: string, suspense = false) {
    const { account } = useWeb3React();

    const shouldFetch = typeof account === 'string' && !!minter;

    const result = useSWR(shouldFetch ? [account, pid, 'Balance'] : null, getStakedBalance(minter!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
