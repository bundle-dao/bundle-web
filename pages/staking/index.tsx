import { Layout, Row, Col } from 'antd';
import styled from 'styled-components';
import React from 'react';
import useBalance from '../../hooks/useBalance';
import useLockedBalance from '../../hooks/useLockedBalance';
import useUnlockedBalance from '../../hooks/useUnlockedBalance';
import { getNamedAddress } from '../../util';
import BundleTokenABI from '../../contracts/BundleToken.json';
import { useWeb3React } from '@web3-react/core';
import useContract from '../../hooks/useContract';
import StakingCard, { VaultCard } from '../../components/StakingCard';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { errorMessage, txMessage, unlockMessage } from '../../components/Messages';

const RowContainer = styled.div`
    width: 100vw;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px;

    p {
        margin-top: 10px;
    }

    @media (max-width: 768px) {
        padding: 30px;
    }
`;

const StakingRow = styled(Row)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
`;

const StakingCol = styled(Col)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        padding-top: 50px;
    }
`;

const BoxImage = styled.img`
    @media (max-width: 768px) {
        margin-right: -20% !important;
        display: none;
    }
`;

const RewardsContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 450px;

    h1 {
        font-size: 30px;
    }
`;

const RewardCard = styled.div`
    height: 75px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    box-shadow: 0px 1px 8px #29292921;
    background-color: ${(props) => props.theme.white};
    z-index: 2;
    border-radius: 15px;
    overflow: hidden;
    margin: 10px 0px;

    p {
        margin: 0px 15px 0px 0px;
        font-size: 17px;
        font-family: 'Visuelt';
    }
`;

const RewardRow = styled.div`
    display: flex;
    align-items: center;

    p {
        margin: 0px 0px 0px 25px;
        font-family: 'Visuelt';
    }
`;

interface ClaimButtonProps {
    enabled: boolean;
}

const ClaimButton = styled.div<ClaimButtonProps>`
    cursor: pointer;
    width: 100%;
    padding: 35px 0px 5px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${(props) => (props.enabled ? props.theme.white : 'default')};
    background-color: ${(props) => (props.enabled ? props.theme.primary : props.theme.white)};
    z-index: 1;
    margin-top: -23px;
    border-radius: 15px;

    &:hover {
        background-color: ${(props) => (props.enabled ? props.theme.primaryDark : props.theme.white)};
    }

    p {
        margin: 0px;
        font-weight: bold;
        font-size: 17px;
        font-family: 'Visuelt';
    }

    transition: background-color 100ms linear;
`;

const StakingContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;

    h1 {
        font-size: 30px;
    }
`;

const Landing: React.FC = (): React.ReactElement => {
    const { account, chainId } = useWeb3React();
    const bundleTokenAddress = getNamedAddress(chainId, 'BundleToken');
    const bundleToken = useContract(bundleTokenAddress!, BundleTokenABI, true);

    const balance = useBalance(bundleToken).data;
    const lockedBalance = useLockedBalance(bundleToken).data;
    const unlockedBalance = useUnlockedBalance(bundleToken).data;

    return (
        <Layout.Content>
            <RowContainer>
                <StakingRow>
                    <StakingCol md={12}>
                        <BoxImage height="80%" width="80%" src="/assets/staking_boxes.svg" />
                    </StakingCol>
                    <StakingCol xs={24} sm={24} md={12}>
                        <RewardsContainer>
                            <h1>Rewards</h1>
                            <RewardCard>
                                <RewardRow>
                                    <img height="100%" src="/assets/wallet.png" />
                                    <p>
                                        Bundle <br /> Balance
                                    </p>
                                </RewardRow>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <p>{`${!!balance ? balance : '0.0'} BDL`}</p>
                                </div>
                            </RewardCard>
                            <RewardCard>
                                <RewardRow>
                                    <img height="100%" src="/assets/lock-closed.png" />
                                    <p>
                                        Locked <br /> Rewards
                                    </p>
                                </RewardRow>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <p>{`${!!lockedBalance ? lockedBalance : '0.0'} BDL`}</p>
                                </div>
                            </RewardCard>
                            <RewardCard style={{ marginBottom: '0px' }}>
                                <RewardRow>
                                    <img height="100%" src="/assets/lock-open.png" />
                                    <p>
                                        Unlocked <br /> Rewards
                                    </p>
                                </RewardRow>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <p>{`${!!unlockedBalance ? unlockedBalance : '0.0'} BDL`}</p>
                                </div>
                            </RewardCard>
                            <ClaimButton
                                enabled={unlockedBalance > 0}
                                onClick={() => {
                                    if (unlockedBalance > 0) {
                                        bundleToken
                                            ?.unlock()
                                            .then((tx: TransactionResponse) => {
                                                txMessage(tx);
                                                return tx.wait(1);
                                            })
                                            .then((tx: TransactionReceipt) => {
                                                unlockMessage(tx);
                                            })
                                            .catch((e: any) => {
                                                errorMessage(e.data.message);
                                            });
                                    }
                                }}
                            >
                                <p>Claim</p>
                            </ClaimButton>
                        </RewardsContainer>
                    </StakingCol>
                </StakingRow>
            </RowContainer>
            <RowContainer style={{ paddingTop: '50px' }}>
                <StakingRow>
                    <StakingCol span={24}>
                        <StakingContainer>
                            <h1>Available Staking Options</h1>
                            <VaultCard
                                image="/assets/logo.svg"
                                name="BDL Vault"
                                imageStyle={{ marginTop: '3px', marginLeft: '2px', zIndex: 2 }}
                                pid="0"
                                vault={getNamedAddress(chainId, 'BundleVault')!}
                                disabled={false}
                                account={account!}
                            />
                            <StakingCard
                                image="/assets/logo.svg"
                                imageSecondary="/assets/BNB.png"
                                name="BDL-BNB"
                                imageStyle={{ marginTop: '3px', marginLeft: '2px', zIndex: 2 }}
                                pid="0"
                                stakeToken={getNamedAddress(chainId, 'BDLBNB')!}
                                disabled={false}
                                account={account!}
                                tokenA="0x7ff78e1cab9a2710eb6486ecbf3d94d125039364"
                                tokenB="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
                            />
                            <StakingCard
                                image="/assets/primary_logo_token.svg"
                                imageSecondary="/assets/BUSD.png"
                                name="bDEFI-BUSD"
                                imageStyle={{ marginTop: '3px', marginLeft: '2px', zIndex: 2 }}
                                pid="1"
                                stakeToken={'0x107a78f4e90141bb4aacdb6b4c903f27baf43e58'}
                                disabled={false}
                                account={account!}
                                tokenA="0x9eeA2a500455cb08BfdF20D1000a0B5CFF63A495"
                                tokenB="0xe9e7cea3dedca5984780bafc599bd69add087d56"
                            />
                            <StakingCard
                                image="/assets/primary_logo_token.svg"
                                imageSecondary="/assets/BUSD.png"
                                name="bCHAIN-BUSD"
                                imageStyle={{ marginTop: '3px', marginLeft: '2px', zIndex: 2 }}
                                pid="2"
                                stakeToken={'0x3666d1eE816852A6BD08196243567D3945058E40'}
                                disabled={false}
                                account={account!}
                                tokenA="0x3E96F79a607d0d2199976c292f9CDF73991A3439"
                                tokenB="0xe9e7cea3dedca5984780bafc599bd69add087d56"
                            />
                            <StakingCard
                                image="/assets/primary_logo_token.svg"
                                imageSecondary="/assets/BUSD.png"
                                name="bSTBL-BUSD"
                                imageStyle={{ marginTop: '3px', marginLeft: '2px', zIndex: 2 }}
                                pid="3"
                                stakeToken={'0xaF748cE79E2c966a660A34c803e63A3e6553E670'}
                                disabled={false}
                                account={account!}
                                tokenA="0x934C7F600d6eE2fb60CdFf61d1b9fC82C6b8C011"
                                tokenB="0xe9e7cea3dedca5984780bafc599bd69add087d56"
                            />
                        </StakingContainer>
                    </StakingCol>
                </StakingRow>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
