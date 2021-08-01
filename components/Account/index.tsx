import MetaMaskOnboarding from '@metamask/onboarding';
import { useWeb3React } from '@web3-react/core';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { useEffect, useRef, useState } from 'react';
import { injected } from '../../connectors';
import { CHAIN_IDS, shortenHex } from '../../util';

interface Props {
    triedToEagerConnect: boolean;
}

const Account = (props: Props) => {
    const { active, error, activate, chainId, account, setError, deactivate } = useWeb3React();

    // initialize metamask onboarding
    const onboarding = useRef<MetaMaskOnboarding>();

    useEffect(() => {
        onboarding.current = new MetaMaskOnboarding();
    });

    // manage connecting state for injected connector
    const [connecting, setConnecting] = useState(false);
    useEffect(() => {
        if (active || error) {
            setConnecting(false);
            onboarding.current?.stopOnboarding();
        }
    }, [active, error]);

    if (error) {
        return null;
    }

    if (!props.triedToEagerConnect) {
        return null;
    }

    if (typeof account !== 'string' || !CHAIN_IDS.includes(chainId)) {
        const hasMetaMaskOrWeb3Available = MetaMaskOnboarding.isMetaMaskInstalled() || window?.ethereum || window?.web3;

        return hasMetaMaskOrWeb3Available ? (
            <a
                onClick={() => {
                    setConnecting(true);

                    activate(injected, undefined, true).catch((error) => {
                        // ignore the error if it's a user rejected request
                        if (error instanceof UserRejectedRequestError) {
                            setConnecting(false);
                        } else {
                            setError(error);
                        }
                    });
                }}
            >
                {MetaMaskOnboarding.isMetaMaskInstalled() ? 'Connect to MetaMask' : 'Connect to Wallet'}
            </a>
        ) : (
            <a onClick={() => onboarding.current?.startOnboarding()}>Install Metamask</a>
        );
    }

    console.log('here');
    return (
        <a
            onClick={() => {
                deactivate();
            }}
        >
            {`${shortenHex(account, 4)}`}
        </a>
    );
};

export default Account;
