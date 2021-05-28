import { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export function shortenHex(hex: string, length: number = 4): string {
    return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

const NAMED_ADDRESSES: { [index: number]: { [index: string]: string } } = {
    97: {
        BundleToken: '0xc6648498bd95cE55915fC514311D75150fFac132',
        Minter: '0xC4838BB05bA7f6a435d7677BeF615C4dAe2Ecc82',
    },
    56: {
        BundleToken: '0xF2cf0682C416D64CBADACD9B017dc115D53BD06e',
        Minter: '0x26E39affCb4CA333f732D64B10c46589dbD59889',
    },
};

export function getNamedAddress(chainId: number | undefined, name: string): string | undefined {
    if (!!chainId) {
        return NAMED_ADDRESSES[chainId][name];
    }
}

export const parseBalance = (balance: BigNumberish, decimals: number = 18, decimalsToDisplay: number = 2): string =>
    Number(formatUnits(balance, decimals)).toFixed(decimalsToDisplay);
