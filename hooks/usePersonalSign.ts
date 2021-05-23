import { useWeb3React } from '@web3-react/core';

export const hexlify = (message: WithImplicitCoercion<string>) => '0x' + Buffer.from(message, 'utf8').toString('hex');

export default function usePersonalSign() {
    const { library, account } = useWeb3React();

    return async (message: WithImplicitCoercion<string>) => {
        return library.send('personal_sign', [hexlify(message), account]);
    };
}
