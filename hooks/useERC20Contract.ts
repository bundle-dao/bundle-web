import useContract from './useContract';
import ERC20ABI from '../contracts/ERC20.json';

export default function useERC20Contract(tokenAddress: string | undefined, withSigner = false) {
    return useContract(tokenAddress, ERC20ABI, withSigner);
}
