import { useWeb3React } from '@web3-react/core';
import Divider from 'antd/lib/divider';
import React, { useState } from 'react';
import styled from 'styled-components';
import useContract from '../../hooks/useContract';
import { formatNumber, getNamedAddress, parseBalance } from '../../util';
import BundleTokenABI from '../../contracts/BundleToken.json';
import MinterABI from '../../contracts/Minter.json';
import useStakedBalance from '../../hooks/useStakedBalance';
import usePendingRewards from '../../hooks/usePendingRewards';
import { Contract } from '@ethersproject/contracts';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Col, Row, InputNumber } from 'antd';
import useUnstakedBalance from '../../hooks/useUnstakedBalance';
import useERC20Contract from '../../hooks/useERC20Contract';
import OutlinedButton from '../Button/Outline';
import FilledButton from '../Button/Filled';
import useApproved from '../../hooks/useApproved';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { approveMessage, depositMessage, errorMessage, harvestMessage, txMessage, withdrawMessage } from '../Messages';
import { formatUnits, parseEther } from '@ethersproject/units';

interface Props {
    image: string;
    imageSecondary?: string;
    name: string;
    imageStyle: React.CSSProperties;
    pid: string;
    stakeToken: string;
    account: string | undefined;
    disabled?: boolean;
}

interface StakingDisplayProps {
    expanded: boolean;
}

interface Disableable {
    disabled?: boolean;
}

const StakingCardContainer = styled.div`
    width: 100%;
    height: auto;
    border-radius: 3px;
    background-color: ${(props) => props.theme.white};
    box-shadow: 0px 2px 4px #0000004d;
    margin: 15px 0px;

    &:hover {
        box-shadow: 0px 3px 6px #0000004d;
    }
`;

const StakingInfoRow = styled(Row)`
    width: 100%;
    padding: 10px 20px;
    min-height: 75px;
    cursor: pointer;
`;

const InfoBlock = styled(Col)`
    height: 100%;
    display: flex;
    align-items: center;
`;

const TextBold = styled.div`
    font-size: 16px;
    font-weight: bold;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const PrimaryContainer = styled.div<Disableable>`
    height: 100%;
    background-color: ${(props) => props.disabled ? props.theme.spaceGrey : props.theme.primary};
    color: ${(props) => props.disabled ? 'default' : props.theme.white};
    border-radius: 3px;
    margin: 0px 10px;
`;

const Text = styled.div`
    font-size: 16px;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const ImageContainer = styled.div`
    width: 55px;
    height: 55px;
    border-radius: 50%;
    box-shadow: 2px 2px 5px #00000012;
    margin-right: 10px;
    z-index: 2;
    background-color: ${props => props.theme.white};
`;

const StakingDisplay = styled.div<StakingDisplayProps>`
    height: ${(props) => (props.expanded ? 'auto' : '0px')};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PercentageContainer = styled.div`
    display: flex;
    flex-direction: row;
    border: ${(props) => `1px solid ${props.theme.grey}`};
    border-radius: 6px;
    height: 26px;
    width: 80%;
    overflow: hidden;
    margin: 0px auto;
`;

const Percentage = styled.div`
    cursor: pointer;
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: ${(props) => props.theme.spaceGrey};
    }

    transition: background-color 100ms linear;
`;

const PercentageDivider = styled.div`
    width: 1px;
    height: 100%;
    background-color: ${(props) => props.theme.grey};
`;

const HideOnMobile = styled.div`
    display: block;

    @media (max-width: 1000px) {
        display: none;
    }
`;

const getApyApr = async (
    pid: string,
    setApy: React.Dispatch<React.SetStateAction<string>>,
    setApr: React.Dispatch<React.SetStateAction<string>>,
    minter: Contract | undefined,
    bundleToken: Contract | undefined,
    stakeToken: Contract | undefined,
    chainId: number | undefined
) => {
    if (!!minter && !!bundleToken && !!stakeToken && !!chainId) {
        const minterAddress = getNamedAddress(chainId, 'Minter');
        const pInfo = await minter.poolInfo(pid);
        const totalAllocPoint = await minter.totalAllocPoint();

        const staked = (await bundleToken.balanceOf(pInfo.stakeToken)).mul(await stakeToken.balanceOf(minterAddress)).mul(2).div(await stakeToken.totalSupply());
        const rewardsPerDay = (await minter.blockRewards()).mul(28800);

        const stakedFormatted = parseFloat(formatUnits(staked));
        const rewardsFormatted = parseFloat(formatUnits(rewardsPerDay));

        const dpr = (rewardsFormatted * 3 / stakedFormatted) * pInfo.allocPoint / totalAllocPoint;
        const apy = (1 + dpr) ** 365 - 1;
        const apr = dpr * 365;

        setApy(`${formatNumber(apy * 100)}%`);
        setApr(`${formatNumber(apr * 100)}%`);
    }
};

const StakingCard: React.FC<Props> = (props: Props): React.ReactElement => {
    const [expanded, setExpanded] = useState(false);
    const [apy, setApy] = useState('...');
    const [apr, setApr] = useState('...');
    const [toStake, setToStake] = useState(BigNumber.from(0));
    const [toUnstake, setToUnstake] = useState(BigNumber.from(0));

    const { chainId } = useWeb3React();
    const minterAddress = getNamedAddress(chainId, 'Minter');
    const bundleTokenAddress = getNamedAddress(chainId, 'BundleToken');
    const minter = useContract(minterAddress!, MinterABI, true);
    const bundleToken = useContract(bundleTokenAddress!, BundleTokenABI, true);
    const stakeToken = useERC20Contract(props.stakeToken, true);

    getApyApr(props.pid, setApy, setApr, minter, bundleToken, stakeToken, chainId);

    const stakedBalance = useStakedBalance(minter, props.pid).data;
    const pendingRewards = usePendingRewards(minter, props.pid).data;
    const unstakedBalance = useUnstakedBalance(stakeToken).data;
    const approved = useApproved(stakeToken, minterAddress).data;

    return (
        <StakingCardContainer>
            <StakingInfoRow onClick={() => setExpanded(!expanded)} align="middle" gutter={[0, 10]}>
                <InfoBlock xs={24} sm={24} md={24} lg={5} style={{ flexGrow: 1 }}>
                    <ImageContainer>
                        <img src={props.image} width="55px" height="55px" style={props.imageStyle} />
                    </ImageContainer>
                    {
                        props.imageSecondary ? <ImageContainer style={{position: "absolute", left: "30px", zIndex: 1}}>
                            <img src={props.imageSecondary} height="55px" />
                        </ImageContainer> : <></>
                    }
                    <TextBold style={props.imageSecondary ? {marginLeft: "40px"} : {}}>{props.name}</TextBold>
                </InfoBlock>
                <HideOnMobile>
                    <Divider type="vertical" style={{ height: '55px' }} />
                </HideOnMobile>
                <InfoBlock xs={24} sm={24} md={24} lg={8} style={{ justifyContent: 'center', flexGrow: 1 }}>
                    <PrimaryContainer disabled={props.disabled}>
                        <TextBold>{`APY: ${apy}`}</TextBold>
                    </PrimaryContainer>
                    <PrimaryContainer disabled={props.disabled}>
                        <TextBold>{`APR: ${apr}`}</TextBold>
                    </PrimaryContainer>
                </InfoBlock>
                <HideOnMobile>
                    <Divider type="vertical" style={{ height: '55px' }} />
                </HideOnMobile>
                <InfoBlock xs={23} sm={23} md={23} lg={9} style={{ justifyContent: 'center', flexGrow: 2 }}>
                    <Text>{`Staked: ${stakedBalance ? parseBalance(stakedBalance) : '0.00'} ${props.name}`}</Text>
                    <Text>{`Rewards: ${pendingRewards ? pendingRewards : '0.00'} BDL`}</Text>
                </InfoBlock>
                <InfoBlock xs={1} sm={1} md={1} lg={1}>
                    {expanded ? (
                        <CaretUpOutlined style={{ marginBottom: '3px' }} />
                    ) : (
                        <CaretDownOutlined style={{ marginBottom: '3px' }} />
                    )}
                </InfoBlock>
            </StakingInfoRow>
            <StakingDisplay expanded={expanded}>
                <Divider style={{ margin: '5px 0px' }} />
                <Row justify="center" style={{ padding: '10px 20px' }}>
                    <Col xs={24} sm={24} md={5} flex="">
                        <Text style={{ margin: '0px' }}>Available: {`${parseBalance(unstakedBalance) || '0.00'}`}</Text>
                        <InputNumber
                            stringMode={true}
                            min={'0'}
                            style={{ width: '100%', margin: '10px 0px 10px 0px' }}
                            value={formatUnits(toStake, 18)}
                            onChange={(newValue) => setToStake(parseEther(newValue))}
                            disabled={props.disabled || !unstakedBalance || (unstakedBalance <= BigNumber.from(0) && typeof props.account === 'string')}
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={5}>
                        <PercentageContainer>
                            <Percentage onClick={() => setToStake(unstakedBalance.div(4))}>
                                <div>25%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance.div(2))}>
                                <div>50%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance.mul(3).div(4))}>
                                <div>75%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance)}>
                                <div>100%</div>
                            </Percentage>
                        </PercentageContainer>
                        <OutlinedButton
                            style={{
                                height: '38px',
                                margin: '12px auto',
                                width: '80%',
                                padding: '0px',
                                display: 'block',
                            }}
                            disabled={props.disabled || !props.account || (approved && (!unstakedBalance || (unstakedBalance <= 0 && typeof props.account === 'string')))}
                            onClick={() => {
                                if (approved) {
                                    minter
                                        ?.deposit(
                                            props.pid,
                                            toStake
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionResponse) => {
                                            depositMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                } else {
                                    stakeToken
                                        ?.approve(
                                            minterAddress,
                                            BigNumber.from(
                                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                                            )
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionResponse) => {
                                            approveMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                }
                            }}
                        >
                            {approved ? 'Deposit' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                    <Col xs={24} sm={24} md={5}>
                        <Text style={{ margin: '0px' }}>Available: {`${parseBalance(stakedBalance) || '0.00'}`}</Text>
                        <InputNumber
                            stringMode={true}
                            min={'0'}
                            style={{ width: '100%', margin: '10px 0px 10px 0px' }}
                            value={formatUnits(toUnstake, 18)}
                            onChange={(newValue) => setToUnstake(parseEther(newValue))}
                            disabled={props.disabled || !stakedBalance || (stakedBalance <= BigNumber.from(0) && typeof props.account === 'string')}
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={5}>
                        <PercentageContainer>
                            <Percentage onClick={() => setToUnstake(stakedBalance.div(4))}>
                                <div>25%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance.div(2))}>
                                <div>50%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance.mul(3).div(4))}>
                                <div>75%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance)}>
                                <div>100%</div>
                            </Percentage>
                        </PercentageContainer>
                        <OutlinedButton
                            style={{
                                height: '38px',
                                margin: '12px auto',
                                width: '80%',
                                padding: '0px',
                                display: 'block',
                            }}
                            disabled={props.disabled || !props.account || (approved && (!stakedBalance || (stakedBalance <= BigNumber.from(0) && typeof props.account === 'string')))}
                            onClick={() => {
                                if (approved) {
                                    minter
                                        ?.withdraw(
                                            props.pid,
                                            toUnstake
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionResponse) => {
                                            withdrawMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                } else {
                                    stakeToken
                                        ?.approve(
                                            minterAddress,
                                            BigNumber.from(
                                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                                            )
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionResponse) => {
                                            approveMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                }
                            }}
                        >
                            {approved ? 'Withdraw' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                    <Col xs={24} sm={24} md={4} style={{ paddingBottom: '12px' }}>
                        <FilledButton
                            style={{
                                height: '100%',
                                margin: '0px auto',
                                width: '80%',
                                padding: '0px',
                                display: 'block',
                                minHeight: '38px',
                            }}
                            disabled={props.disabled || !pendingRewards || pendingRewards <= 0}
                            onClick={() => {
                                minter
                                    ?.harvest(props.pid)
                                    .then((tx: TransactionResponse) => {
                                        txMessage(tx);
                                        return tx.wait(1);
                                    })
                                    .then((tx: TransactionResponse) => {
                                        harvestMessage(tx);
                                    })
                                    .catch((e: any) => {
                                        errorMessage(e.data.message);
                                    });
                            }}
                        >
                            <span color="white">Harvest</span>
                        </FilledButton>
                    </Col>
                </Row>
            </StakingDisplay>
        </StakingCardContainer>
    );
};

export default StakingCard;
