import { BigNumber } from '@ethersproject/bignumber';
import useContract from '../hooks/useContract';
import { parseEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import ERC20 from '../contracts/ERC20.json';
import PancakeRouter from '../contracts/PancakeRouter.json';
import { Token, Pair, TokenAmount } from '@pancakeswap/sdk';

export const ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
export const PEG = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
export const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
export const ETH = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';
export const UST = '0x23396cf899ca06c4472205fc903bdb4de249d6fc';

export const SWAP_ASSETS: Asset[] = [
    {
        symbol: 'BUSD',
        address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    },
    {
        symbol: 'WBNB',
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
];

export const SWAP_PATHS: { [key: string]: string[] } = {
    WBNB: [PEG],
    BTCB: [PEG],
    ETH: [WBNB, PEG],
    DOT: [WBNB, PEG],
    ADA: [WBNB, PEG],
    UNI: [WBNB, PEG],
    Cake: [PEG],
    MIR: [UST, PEG],
    COMP: [ETH, WBNB, PEG],
    SUSHI: [ETH, PEG],
    LINK: [WBNB, PEG],
    ALPACA: [PEG],
    CREAM: [WBNB, PEG],
    BIFI: [WBNB, PEG],
    USDT: [PEG],
    USDC: [PEG],
    DAI: [PEG],
    bDEFI: [PEG],
    bSTBL: [PEG],
    bCHAIN: [PEG],
    BDL: [WBNB, PEG],
    BUSD: [],
};

export interface Asset {
    symbol: string;
    address: string;
    price?: BigNumber;
    name?: string;
    amount?: BigNumber;
    cap?: BigNumber;
}

export interface LiquidityInfo {
    [key: string]: {};
}

export const getAsset = async (
    address: string | undefined,
    provider: any,
    setAsset?: any,
    loadCap?: boolean
): Promise<Asset> => {
    if (!address || !provider) return { symbol: '', address: '' };

    const token = new Contract(address, ERC20, provider);
    const router = new Contract(ROUTER, PancakeRouter, provider);
    const symbol = await token!.symbol();
    const price =
        symbol == 'BUSD'
            ? parseEther('1')
            : (await router!.getAmountsOut(parseEther('1'), [address, ...SWAP_PATHS[symbol]]))[
                  SWAP_PATHS[symbol].length
              ]
                  .mul(10000)
                  .div(9975);
    const asset: Asset = { symbol, price, address };

    if (loadCap) {
        asset.cap = await token!.totalSupply();
    }

    if (setAsset) {
        setAsset(asset);
    }

    return asset;
};

export const getPrice = async (route: string[]): Promise<BigNumber> => {
    const router = useContract(ROUTER, PancakeRouter);
    const tokensOut = await router!.getAmountsOut(parseEther('1'), route);
    return tokensOut[tokensOut.length - 1];
};

// PCS functions

export const getPairAmounts = async (
    tokenA: Token | undefined,
    tokenB: Token | undefined,
    provider: any,
    chainId?: number | undefined
): Promise<TokenAmount[]> => {
    if (!tokenA || !tokenB || !provider) return [];
    const tokenAContract = new Contract(tokenA.address, ERC20, provider);
    const tokenBContract = new Contract(tokenB.address, ERC20, provider);
    // Default to loading test fund on testnet
    const pair = chainId == 97 ? '0xebE6caB321728A8286813Dd1F8793C914de6E6A8' : Pair.getAddress(tokenA, tokenB);
    return [
        new TokenAmount(tokenA, (await tokenAContract!.balanceOf(pair)).toString()),
        new TokenAmount(tokenB, (await tokenBContract!.balanceOf(pair)).toString()),
    ];
};
