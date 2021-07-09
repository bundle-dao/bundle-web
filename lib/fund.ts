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
}

type NamedFunds = { [key: string]: Fund };

const FUNDS: NamedFunds = {};

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
    const bundle = new Contract(fund.address, Bundle, provider);

    const addresses = await bundle.getCurrentTokens();

    for (const address of addresses) {
        const asset = await getAsset(address, provider);
        asset.amount = await bundle.getBalance(address);
        assets.push(asset);
    }

    assets.sort((a: Asset, b: Asset): number => {
        if (a.amount!.mul(a.price!) >= b.amount!.mul(b.price!)) {
            return -1;
        } else {
            return 1;
        }
    });

    if (setAssets) {
        setAssets(assets);
    }

    return assets;
};
