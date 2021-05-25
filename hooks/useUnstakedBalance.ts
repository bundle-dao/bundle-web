import { BigNumberish } from '@ethersproject/bignumber';
import useSWR from 'swr';
import { parseBalance } from '../util';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import useERC20Contract from './useERC20Contract';

function getPendingBalance(token: Contract) {
    return async (address: any, _: any) => {
        return token.balanceOf(address).then((balance: BigNumberish) => parseBalance(balance));
    };
}

export default function useUnstakedBalance(token: Contract | undefined, suspense = false) {
    const { account } = useWeb3React();
    const shouldFetch = typeof account === 'string' && !!token;

    const result = useSWR(shouldFetch ? [account, 'UnstakedBalance'] : null, getPendingBalance(token!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}