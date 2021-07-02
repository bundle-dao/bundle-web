import { BigNumberish } from '@ethersproject/bignumber';
import useSWR from 'swr';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getApproved(token: Contract) {
    return async (owner: any, spender: any, _: any) => {
        return token.allowance(owner, spender).then((allowance: BigNumberish) => (allowance > 0 ? true : false));
    };
}

export default function useApproved(token: Contract | undefined, spender: string | undefined, suspense = false) {
    const { account } = useWeb3React();
    const shouldFetch = typeof account === 'string' && !!token && typeof spender === 'string';

    const result = useSWR(shouldFetch ? [account, spender, token, 'Approved'] : null, getApproved(token!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
