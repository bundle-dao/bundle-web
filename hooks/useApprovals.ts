import { BigNumberish } from '@ethersproject/bignumber';
import useSWR from 'swr';
import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';

function getApprovals(tokens: Contract[]) {
    return async (owner: any, spender: any, _: any) => {
        return Promise.all(
            tokens.map(
                async (token) =>
                    await token
                        .allowance(owner, spender)
                        .then((allowance: BigNumberish) => (allowance > 0 ? true : false))
            )
        );
    };
}

export default function useApprovals(tokens: Contract[] | undefined, spender: string | undefined, suspense = false) {
    const { account } = useWeb3React();
    const shouldFetch = typeof account === 'string' && !!tokens && typeof spender === 'string';

    const result = useSWR(shouldFetch ? [account, spender, tokens?.length, 'Approvals'] : null, getApprovals(tokens!), {
        suspense,
    });

    useKeepSWRDataLiveAsBlocksArrive(result.mutate);

    return result;
}
