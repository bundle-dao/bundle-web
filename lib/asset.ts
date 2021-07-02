import { BigNumber } from '@ethersproject/bignumber';
import useContract from '../hooks/useContract';
import { parseEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import ERC20 from '../contracts/ERC20.json';
import PancakeRouter from '../contracts/PancakeRouter.json';

export const ROUTER = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';
export const PEG = '0xe25075950309995A6D18d7Dfd5B34EF02028F059';

export const SWAP_ASSETS: Asset[] = [
    {
        symbol: 'BUSD',
        address: '0xe25075950309995A6D18d7Dfd5B34EF02028F059',
    }, {
        symbol: 'BNB',
        address: '0xe25075950309995A6D18d7Dfd5B34EF02028F059',
    },
]

export interface Asset {
    symbol: string;
    address: string;
    price?: BigNumber;
    name?: string;
    amount?: BigNumber;
    cap?: BigNumber;
}

export const getAsset = async (address: string | undefined, provider: any, setAsset?: any, loadCap?: boolean): Promise<Asset> => {
    if (!address || !provider) return {symbol: '', address: ''};

    const token = new Contract(address, ERC20, provider);
    const router = new Contract(ROUTER, PancakeRouter, provider);
    const symbol = await token!.symbol();
    const price = (await router!.getAmountsOut(parseEther('1'), [address, PEG]))[1];
    const asset: Asset = { symbol, price, address };

    if (loadCap) {
        asset.cap = await token!.totalSupply();
    }

    if (setAsset) {
        setAsset(asset);
    }

    return asset;
}

export const getPrice = async(route: string[]): Promise<BigNumber> => {
    const router = useContract(ROUTER, PancakeRouter);
    const tokensOut = (await router!.getAmountsOut(parseEther('1'), route));
    return tokensOut[tokensOut.length - 1];
}
