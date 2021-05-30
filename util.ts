import { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export function shortenHex(hex: string, length: number = 4): string {
    return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

const NAMED_ADDRESSES: { [index: number]: { [index: string]: string } } = {
    97: {
        BundleToken: '0x87d1a30f62100E575D1AD1F2C9e08234E60fa1E3',
        Minter: '0x8435DF5A52D6Fc955d5e1F4ff28b77e67149C2eB',
    },
    56: {
        BundleToken: '0x7fF78E1cab9A2710Eb6486Ecbf3D94D125039364',
        Minter: '0xA54D10C6666172824Da54C0d90BcdE36B6dAbd85',
    },
};

export function getNamedAddress(chainId: number | undefined, name: string): string | undefined {
    if (!!chainId) {
        return NAMED_ADDRESSES[chainId][name];
    }
}

export const parseBalance = (balance: BigNumberish, decimals: number = 18, decimalsToDisplay: number = 2): string => {
    if (balance) {
        return Number(formatUnits(balance, decimals)).toFixed(decimalsToDisplay);
    } else {
        return '0.00'
    }
}