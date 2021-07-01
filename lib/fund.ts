import Bundle from '../contracts/Bundle.json';
import { getAsset, Asset } from "./asset";
import { Contract } from '@ethersproject/contracts';

export interface Fund {
    name: string;
    address: string;
    assets: string[];
    symbol: string;
    description?: string;
};

type NamedFunds = { [key: string]:Fund };

const FUNDS: NamedFunds = {
    'TEST': {
        name: 'Test',
        symbol: 'TEST',
        address: '0x596ff52ceaa85785d1c40ed7a7a5bdee4fcaaa9b',
        assets: ['USDC', 'BNB', 'BTC', 'UNI', 'BNB', 'BNB', 'BNB'],
        description: 'A hyper-focused index of the most successful large-cap decentralized finance protocols across Ethereum.',
    },
    'TST2': {
        name: 'Test 2',
        symbol: 'TST2',
        address: '0xde59e2b0089354d2274a1af48c923367b76d0253',
        assets: ['USDC', 'BNB', 'BTC', 'UNI'],
        description: 'A hyper-focused index of the most successful large-cap decentralized finance protocols across Ethereum.',
    },
    'TST3': {
        name: 'Test 3',
        symbol: 'TST3',
        address: '',
        assets: ['BNB', 'BTC'],
        description: 'A hyper-focused index of the most successful large-cap decentralized finance protocols across Ethereum.',
    },
};

export const getFundByName = (name: string | undefined): Fund | undefined => {
    if (name) {
        return FUNDS[name];
    }
};

export const getAssets = async (fund: Fund | undefined, provider: any, setAssets?: any): Promise<Asset[]> => {
    if (!fund || !provider) { return [] };

    const assets: Asset[] = [];
    const bundle = new Contract(fund.address, Bundle, provider);

    const addresses = await bundle.getCurrentTokens();

    for (const address of addresses) {
        const asset = await getAsset(address, provider);
        asset.amount = await bundle.getBalance(address);
        assets.push(asset);
    };

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
}
