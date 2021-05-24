import { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export function shortenHex(hex: string, length: number = 4): string {
    return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

const ETHERSCAN_PREFIXES: { [index: number]: string } = {
    1: '',
    3: 'ropsten.',
    4: 'rinkeby.',
    5: 'goerli.',
    42: 'kovan.',
};

const NAMED_ADDRESSES: { [index: number]: { [index: string]: string } } = {
    97: {
        "BundleToken": "0xc6648498bd95cE55915fC514311D75150fFac132",
        "Minter": "0xC4838BB05bA7f6a435d7677BeF615C4dAe2Ecc82"
    },
    56: {}
}

export function getNamedAddress(chainId: number, name: string): string {
    return NAMED_ADDRESSES[chainId][name];
}

export function formatEtherscanLink(type: 'Account' | 'Transaction', data: [number, string]): string {
    switch (type) {
        case 'Account': {
            const [chainId, address] = data;
            return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`;
        }
        case 'Transaction': {
            const [chainId, hash] = data;
            return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`;
        }
    }
}

export const parseBalance = (balance: BigNumberish, decimals: number = 18, decimalsToDisplay: number = 3): string =>
    Number(formatUnits(balance, decimals)).toFixed(decimalsToDisplay);
