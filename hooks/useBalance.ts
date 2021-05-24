import { BigNumberish } from '@ethersproject/bignumber';
import useSWR from 'swr';
import { parseBalance } from '../util';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getBalance(bundleToken: Contract) {
    return async (address: any, _: any) => {
        return bundleToken.balanceOf(address).then((balance: BigNumberish) => parseBalance(balance));
    };
}

export default function useBalance(bundleToken: Contract | undefined, suspense = false) {
    const { account } = useWeb3React();

    const shouldFetch = typeof account === 'string' && !!bundleToken;

    const result = useSWR(shouldFetch ? [account, 'Balance'] : null, getBalance(bundleToken!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
