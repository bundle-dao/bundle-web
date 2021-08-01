import Bundle from '../contracts/Bundle.json';
import { getAsset, Asset } from './asset';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';

export interface Fund {
    name: string;
    address: string;
    assets: string[];
    symbol: string;
    description?: string;
    autoGas?: string;
    cgid?: string;
}

type NamedFunds = { [key: string]: Fund };

const FUNDS: NamedFunds = {
    bDEFI: {
        name: 'bDeFi Index',
        address: '0x9eea2a500455cb08bfdf20d1000a0b5cff63a495',
        assets: ['UNI', 'LINK', 'SUSHI', 'COMP', 'CAKE', 'BIFI', 'ALPACA', 'MIR', 'CREAM'],
        symbol: 'bDEFI',
        description: 'A hyper-focused index containing market-leading cross-chain and BSC native DeFi protocols.',
        autoGas: '5000000',
        cgid: 'bdefi',
    },
    bCHAIN: {
        name: 'bChain Index',
        address: '0x3e96f79a607d0d2199976c292f9cdf73991a3439',
        assets: ['BTCB', 'ETH', 'WBNB', 'ADA', 'DOT'],
        symbol: 'bCHAIN',
        description: 'A hyper-focused index containing native assets of market-leading chains and high-cap protocols.',
        autoGas: '3000000',
        cgid: 'bchain',
    },
    bSTBL: {
        name: 'bStable Index',
        address: '0x934c7f600d6ee2fb60cdff61d1b9fc82c6b8c011',
        assets: ['USDC', 'DAI', 'BUSD', 'USDT'],
        symbol: 'bSTBL',
        description: 'A risk-mitigated stable index of high-cap collateralized and algorithmic stablecoins.',
        autoGas: '1500000',
        cgid: 'bstable',
    },
};

export const getFundByName = (name: string | undefined): Fund | undefined => {
    if (name) {
        return FUNDS[name];
    }
};

export const getAssets = async (fund: Fund | undefined, provider: any, setAssets?: any): Promise<Asset[]> => {
    if (!fund || !provider) {
        return [];
    }

    const assets: Asset[] = [];
    const amounts: BigNumber[] = [];
    const bundle = new Contract(fund.address, Bundle, provider);

    const addresses = await bundle.getCurrentTokens();

    const assetPromises = [];
    const balancePromises = [];

    for (const address of addresses) {
        assetPromises.push(getAsset(address, provider));
        balancePromises.push(bundle.getBalance(address));
    }

    await Promise.all(balancePromises).then((values) => {
        values.forEach((a) => {
            amounts.push(a);
        });
    });

    await Promise.all(assetPromises).then((values) => {
        values.forEach((a, i) => {
            assets.push(a);
            assets[i].amount = amounts[i];
        });
    });

    if (setAssets) {
        setAssets(assets);
    }

    return assets;
};
