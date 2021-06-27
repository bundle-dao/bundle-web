export interface Fund {
    name: string;
    address: string;
    assets: string[];
    symbol: string;
};

type NamedFunds = { [key: string]:Fund };

const FUNDS: NamedFunds = {
    'TST': {
        name: 'Test',
        symbol: 'TST',
        address: '0x032e5687efba927c8fe442da950721b3d4412a74',
        assets: ['USDC', 'BNB', 'BTC', 'UNI', 'BNB', 'BNB', 'BNB'],
    },
    'TST2': {
        name: 'Test 2',
        symbol: 'TST2',
        address: '0xde59e2b0089354d2274a1af48c923367b76d0253',
        assets: ['USDC', 'BNB', 'BTC', 'UNI'],
    },
    'TST3': {
        name: 'Test 3',
        symbol: 'TST3',
        address: '',
        assets: ['BNB', 'BTC'],
    },
};

export const getFundByName = (name: string) => {
    return FUNDS[name];
};
