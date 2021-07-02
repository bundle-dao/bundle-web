import { ChainId, Token } from '@pancakeswap/sdk';
import { Asset } from '../lib/asset';
import { useMemo } from 'react';
import { CHAIN_IDS } from '../util';
import { Fund } from '../lib/fund';

export default function useToken(chainId: number | undefined, asset: Asset | Fund | undefined) {
    return useMemo(() => {
        if (!chainId || !CHAIN_IDS.includes(chainId) || !asset) return undefined;
        return new Token(chainId as ChainId, asset.address, 18, asset.symbol, asset.name);
    }, [chainId, asset]);
}
