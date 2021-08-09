import { useWeb3React } from '@web3-react/core';
import Divider from 'antd/lib/divider';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useContract from '../../hooks/useContract';
import { formatNumber, getNamedAddress, parseBalance } from '../../util';
import BundleTokenABI from '../../contracts/BundleToken.json';
import VaultABI from '../../contracts/Vault.json';
import { Contract } from '@ethersproject/contracts';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Col, Row, InputNumber } from 'antd';
import useRawBalance from '../../hooks/useRawBalance';
import OutlinedButton from '../Button/Outline';
import useApproved from '../../hooks/useApproved';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { approveMessage, depositMessage, errorMessage, txMessage, withdrawMessage } from '../Messages';
import { formatUnits, parseEther } from '@ethersproject/units';
import { TransactionReceipt } from '@ethersproject/providers';
import { fetchPrice } from '../../lib/coingecko';
import useVaultBalance from '../../hooks/useVaultBalance';

interface Props {
    image: string;
    name: string;
    imageStyle: React.CSSProperties;
    pid: string;
    vault: string;
    account: string | undefined;
    disabled?: boolean;
}

interface VaultDisplayProps {
    expanded: boolean;
}

interface Disableable {
    disabled?: boolean;
}

const VaultCardContainer = styled.div`
    width: 100%;
    height: auto;
    border-radius: 15px;
    background-color: ${(props) => props.theme.white};
    box-shadow: 0px 2px 4px #0000004d;
    margin: 15px 0px;

    &:hover {
        box-shadow: 0px 3px 4px #0000004d;
    }

    transition: box-shadow 0.1s linear;
`;

const VaultInfoRow = styled(Row)`
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
    background-color: ${(props) => (props.disabled ? props.theme.spaceGrey : props.theme.primary)};
    color: ${(props) => (props.disabled ? 'default' : props.theme.white)};
    border-radius: 15px;
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
    background-color: ${(props) => props.theme.white};
`;

const VaultDisplay = styled.div<VaultDisplayProps>`
    height: ${(props) => (props.expanded ? 'auto' : '0px')};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PercentageContainer = styled.div`
    display: flex;
    flex-direction: row;
    border: ${(props) => `1px solid ${props.theme.grey}`};
    border-radius: 15px;
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

const LiquidityText = styled.span`
    color: ${(props) => props.theme.primary};
`;

const getApr = async (
    setApr: React.Dispatch<React.SetStateAction<string>>,
    bundleToken: Contract | undefined,
    vault: Contract | undefined,
    chainId: number | undefined
) => {
    if (!!bundleToken && !!vault && !!chainId) {
        const priceData = await fetchPrice('bundle-dao');
        const price = priceData['bundle-dao']['usd'];
        const total = await bundleToken.balanceOf(vault.address);
        const tvl = price * total.div(parseEther('1'));

        const apr = (2000 / tvl) * 12;

        setApr(`${formatNumber(apr * 100)}%`);
    }
};

const VaultCard: React.FC<Props> = (props: Props): React.ReactElement => {
    const [expanded, setExpanded] = useState(false);
    const [apr, setApr] = useState('...');
    const [toStake, setToStake] = useState(BigNumber.from(0));
    const [toUnstake, setToUnstake] = useState(BigNumber.from(0));

    const { chainId } = useWeb3React();
    const bundleTokenAddress = getNamedAddress(chainId, 'BundleToken');
    const bundleToken = useContract(bundleTokenAddress!, BundleTokenABI, true);
    const vault = useContract(props.vault, VaultABI, true);

    useEffect(() => {
        if (!props.disabled) {
            getApr(setApr, bundleToken, vault, chainId);
        }
    }, [chainId]);

    const stakedBalance = useVaultBalance(vault).data;
    const unstakedBalance = useRawBalance(bundleToken).data;
    const approved = useApproved(bundleToken, props.vault).data;

    return (
        <VaultCardContainer>
            <VaultInfoRow onClick={() => setExpanded(!expanded)} align="middle" gutter={[0, 10]}>
                <InfoBlock xs={24} sm={24} md={24} lg={5} style={{ flexGrow: 1 }}>
                    <ImageContainer style={{ marginLeft: '20px' }}>
                        <img src={props.image} width="55px" height="55px" style={props.imageStyle} />
                    </ImageContainer>
                    <TextBold style={{ marginLeft: '20px' }}>{props.name}</TextBold>
                </InfoBlock>
                <HideOnMobile>
                    <Divider type="vertical" style={{ height: '55px' }} />
                </HideOnMobile>
                <InfoBlock xs={24} sm={24} md={24} lg={8} style={{ justifyContent: 'center', flexGrow: 1 }}>
                    <PrimaryContainer disabled={props.disabled}>
                        <TextBold>{`APR: ${apr}`}</TextBold>
                    </PrimaryContainer>
                </InfoBlock>
                <HideOnMobile>
                    <Divider type="vertical" style={{ height: '55px' }} />
                </HideOnMobile>
                <InfoBlock xs={23} sm={23} md={23} lg={9} style={{ justifyContent: 'center', flexGrow: 2 }}>
                    <Text>{`Staked: ${stakedBalance ? parseBalance(stakedBalance) : '0.00'} BDL`}</Text>
                </InfoBlock>
                <InfoBlock xs={1} sm={1} md={1} lg={1}>
                    {expanded ? (
                        <CaretUpOutlined style={{ marginBottom: '3px' }} />
                    ) : (
                        <CaretDownOutlined style={{ marginBottom: '3px' }} />
                    )}
                </InfoBlock>
            </VaultInfoRow>
            <VaultDisplay expanded={expanded}>
                <Divider style={{ margin: '5px 0px' }} />
                <Row justify="center" style={{ padding: '10px 20px 0px 20px' }}>
                    <Col xs={24} sm={24} md={6} flex="">
                        <Text style={{ margin: '0px' }}>Available: {`${parseBalance(unstakedBalance) || '0.00'}`}</Text>
                        <InputNumber
                            stringMode={true}
                            min={'0'}
                            style={{ width: '100%', margin: '10px 0px 10px 0px' }}
                            value={formatUnits(toStake, 18)}
                            onChange={(newValue) => setToStake(parseEther(newValue))}
                            disabled={
                                props.disabled ||
                                !unstakedBalance ||
                                (unstakedBalance <= BigNumber.from(0) && typeof props.account === 'string')
                            }
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
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
                            disabled={
                                props.disabled ||
                                !props.account ||
                                (approved &&
                                    (!unstakedBalance || (unstakedBalance <= 0 && typeof props.account === 'string')))
                            }
                            onClick={() => {
                                if (approved) {
                                    vault
                                        ?.deposit(toStake)
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            depositMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.message || e.data.message);
                                        });
                                } else {
                                    bundleToken
                                        ?.approve(
                                            props.vault,
                                            BigNumber.from(
                                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                                            )
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            approveMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.message || e.data.message);
                                        });
                                }
                            }}
                        >
                            {approved ? 'Deposit' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Text style={{ margin: '0px' }}>Available: {`${parseBalance(stakedBalance) || '0.00'}`}</Text>
                        <InputNumber
                            stringMode={true}
                            min={'0'}
                            style={{ width: '100%', margin: '10px 0px 10px 0px' }}
                            value={formatUnits(toUnstake, 18)}
                            onChange={(newValue) => setToUnstake(parseEther(newValue))}
                            disabled={
                                props.disabled ||
                                !stakedBalance ||
                                (stakedBalance <= BigNumber.from(0) && typeof props.account === 'string')
                            }
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
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
                            disabled={
                                props.disabled ||
                                !props.account ||
                                (approved &&
                                    (!stakedBalance ||
                                        (stakedBalance <= BigNumber.from(0) && typeof props.account === 'string')))
                            }
                            onClick={() => {
                                if (approved) {
                                    vault
                                        ?.withdraw(toUnstake)
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            withdrawMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.message || e.data.message);
                                        });
                                } else {
                                    bundleToken
                                        ?.approve(
                                            props.vault,
                                            BigNumber.from(
                                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                                            )
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            approveMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.message || e.data.message);
                                        });
                                }
                            }}
                        >
                            {approved ? 'Withdraw' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                </Row>
            </VaultDisplay>
        </VaultCardContainer>
    );
};

export default VaultCard;
