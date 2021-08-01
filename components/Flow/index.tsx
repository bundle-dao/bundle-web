import { ArrowDownOutlined } from '@ant-design/icons';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { formatUnits, parseEther } from '@ethersproject/units';
import { InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useApproved from '../../hooks/useApproved';
import useERC20Contract from '../../hooks/useERC20Contract';
import useRawBalance from '../../hooks/useRawBalance';
import { Asset, PEG, SWAP_PATHS } from '../../lib/asset';
import { Fund, getAssets } from '../../lib/fund';
import Outline from '../Button/Outline';
import Card from '../Card';
import { Col, Row } from '../Layout';
import { approveMessage, burnMessage, errorMessage, mintMessage, txMessage } from '../Messages';
import { useWeb3React } from '@web3-react/core';
import Underlying from './subcomponents/Underlying.tsx';
import useContract from '../../hooks/useContract';
import BundleABI from '../../contracts/Bundle.json';
import BundleRouterABI from '../../contracts/BundleRouter.json';
import useBalance from '../../hooks/useBalance';
import { parseBalance } from '../../util';
import { Contract } from '@ethersproject/contracts';
import Filled from '../Button/Filled';
import useApprovals from '../../hooks/useApprovals';
import ERC20ABI from '../../contracts/ERC20.json';
import useRawBalances from '../../hooks/useRawBalances';

interface Props {
    fund: Fund | undefined;
    fundAsset: Asset | undefined;
    assets: Asset[];
    nav: BigNumber;
    disabled?: boolean;
    isMinting?: boolean;
}

interface SelectorProps {
    selected?: boolean;
}

const TextBold = styled.div`
    font-size: 16px;
    font-weight: bold;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const Selector = styled.div<SelectorProps>`
    width: 100px;
    height: 35px;
    margin: 10px;
    padding: 5px 20px 8px 20px;
    border-radius: 10px;
    border: ${(props) => '2px solid ' + (props.selected ? props.theme.primary : props.theme.grey)};
    color: ${(props) => (props.selected ? props.theme.primary : props.theme.grey)};
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        cursor: pointer;
        border: ${(props) => '2px solid ' + props.theme.primary};
        color: ${(props) => props.theme.primary};
    }

    transition: color 100ms linear, border 100ms linear;
`;

const InputContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100px;
    overflow: hidden;
    margin 10px 0px 5px 0px;
`;

const Field = styled.span`
    color: ${(props) => props.theme.grey};
`;

const Primary = styled.span`
    color: ${(props) => props.theme.primary};

    &:hover {
        cursor: pointer;
    }
`;

export const MINT = 'MINT';
export const BURN = 'BURN';

export const AUTO = 'AUTO';
export const MANUAL = 'MANUAL';

const BUNDLE_ROUTER = '0x09a69DE410a84fD363273c716478a72C826342Ae';

const Flow: React.FC<Props> = (props: Props): React.ReactElement => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { library, account } = useWeb3React();

    const handleOk = () => {
        if (props.isMinting) {
            bundleRouter
                ?.mint(
                    fundContract?.address,
                    PEG,
                    pegAmount,
                    fundAmount,
                    `0x${(Math.floor(new Date().getTime() / 1000) + 600).toString(16)}`,
                    paths,
                    props.fund?.autoGas ? { gasLimit: props.fund?.autoGas } : {}
                )
                .then((tx: TransactionResponse) => {
                    txMessage(tx);
                    return tx.wait(1);
                })
                .then((tx: TransactionReceipt) => {
                    mintMessage(tx);
                })
                .catch((e: any) => {
                    errorMessage(e.message || e.data.message);
                });
        } else {
            bundleRouter
                ?.redeem(
                    fundContract?.address,
                    PEG,
                    fundAmount,
                    pegAmount,
                    `0x${(Math.floor(new Date().getTime() / 1000) + 600).toString(16)}`,
                    paths,
                    props.fund?.autoGas ? { gasLimit: props.fund?.autoGas } : {}
                )
                .then((tx: TransactionResponse) => {
                    txMessage(tx);
                    return tx.wait(1);
                })
                .then((tx: TransactionReceipt) => {
                    burnMessage(tx);
                })
                .catch((e: any) => {
                    errorMessage(e.message || e.data.message);
                });
        }

        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const [amounts, setAmounts] = useState(Array(props.assets.length).fill(BigNumber.from('0')));
    const [pegAmount, setPegAmount] = useState(BigNumber.from('0'));
    const [fundAmount, setFundAmount] = useState(BigNumber.from('0'));
    const [mode, setMode] = useState(AUTO);

    const [contracts, setContracts] = useState(
        props.assets.map(
            (asset) => new Contract(asset.address, ERC20ABI, library.getSigner(account).connectUnchecked())
        )
    );

    const approvals: boolean[] | undefined = useApprovals(contracts, props.fund?.address).data;
    const balances: BigNumber[] | undefined = useRawBalances(contracts).data;

    const pegContract = useERC20Contract(PEG, true);
    const pegBalance = useRawBalance(pegContract).data;
    const pegApproved = useApproved(pegContract, BUNDLE_ROUTER).data;

    const fundContract = useContract(props.fund?.address, BundleABI, true);
    const fundBalance = useRawBalance(fundContract).data;
    const fundApproved = useApproved(fundContract, BUNDLE_ROUTER).data;

    const bundleRouter = useContract(BUNDLE_ROUTER, BundleRouterABI, true);

    const fundAdjustAmounts = (amount: BigNumber) => {
        setFundAmount(amount);

        if (props.fundAsset && props.assets.length > 0) {
            const newAmounts = [...amounts];
            const portion = amount.mul(parseEther('1')).div(props.fundAsset.cap!);

            newAmounts.forEach((_, idx) => {
                newAmounts[idx] = props.isMinting
                    ? portion.mul(props.assets[idx].amount!).div(parseEther('1')).mul(10001).div(10000)
                    : portion.mul(props.assets[idx].amount!).div(parseEther('1')).mul(980).div(1000);
            });

            setAmounts(newAmounts);
        }

        if (props.fundAsset) {
            if (props.isMinting) {
                setPegAmount(amount.mul(props.nav).mul(10000).div(9900).div(props.fundAsset.cap!));
            } else {
                setPegAmount(amount.mul(props.nav).mul(9900).div(10000).mul(980).div(1000).div(props.fundAsset.cap!));
            }
        }
    };

    useEffect(() => {
        setAmounts(Array(props.assets.length).fill(BigNumber.from('0')));
        setFundAmount(BigNumber.from('0'));
        setPegAmount(BigNumber.from('0'));
    }, [props.isMinting]);

    useEffect(() => {
        setAmounts(Array(props.assets.length).fill(BigNumber.from('0')));
        setContracts(
            props.assets.map(
                (asset) => new Contract(asset.address, ERC20ABI, library.getSigner(account).connectUnchecked())
            )
        );
    }, [props.assets.length]);

    const paths = props.isMinting
        ? props.assets.map((asset) => [...[...SWAP_PATHS[asset.symbol]].reverse(), asset.address])
        : props.assets.map((asset) => [asset.address, ...SWAP_PATHS[asset.symbol]]);

    const underlying =
        mode == MANUAL ? (
            props.assets.map((asset, index) => {
                return (
                    <Underlying
                        key={asset.symbol + '_underlying'}
                        asset={asset}
                        isMinting={props.isMinting}
                        value={amounts[index]}
                        fund={props.fund}
                        approved={approvals ? approvals[index] : undefined}
                        balance={balances ? balances[index] : undefined}
                        disabled={
                            props.assets.reduce((a: boolean, b: Asset) => {
                                return a || !b.amount || b.amount?.isZero();
                            }, false) ||
                            !props.fundAsset ||
                            true
                        }
                        setValue={(value: BigNumber | undefined) => {
                            value = value ? value : BigNumber.from('0');
                            const newAmounts = [...amounts];
                            newAmounts[index] = value;

                            if (props.assets.length > 0) {
                                const portion = value.mul(parseEther('1')).div(props.assets[index].amount!);

                                newAmounts.forEach((_, idx) => {
                                    newAmounts[idx] = portion.mul(props.assets[idx].amount!).div(parseEther('1'));
                                });

                                if (props.fundAsset) {
                                    setFundAmount(portion.mul(props.fundAsset.cap!).div(parseEther('1')));
                                }

                                setAmounts(newAmounts);
                            }
                        }}
                    />
                );
            })
        ) : (
            <>
                <Col span={24}>
                    <InputContainer>
                        <InputNumber
                            style={{
                                padding: '40px 0px 0px 8px',
                                width: '100%',
                                height: '100%',
                                borderRadius: '15px',
                                overflow: 'hidden',
                                boxShadow: 'none',
                            }}
                            stringMode={true}
                            min={'0'}
                            value={formatUnits(pegAmount, 18)}
                            onChange={(value) => {
                                const amount = parseEther(value ? value : '0');
                                setPegAmount(amount);

                                if (props.fundAsset) {
                                    const tempFundAmount = props.isMinting
                                        ? amount.mul(props.fundAsset.cap!).mul(9900).div(10000).div(props.nav)
                                        : amount
                                              .mul(props.fundAsset.cap!)
                                              .mul(10000)
                                              .mul(1000)
                                              .div(9900)
                                              .div(980)
                                              .div(props.nav);

                                    setFundAmount(tempFundAmount);

                                    if (props.assets.length > 0) {
                                        const newAmounts = [...amounts];
                                        const portion = tempFundAmount.mul(parseEther('1')).div(props.fundAsset.cap!);

                                        newAmounts.forEach((_, idx) => {
                                            newAmounts[idx] = props.isMinting
                                                ? portion
                                                      .mul(props.assets[idx].amount!)
                                                      .div(parseEther('1'))
                                                      .mul(10001)
                                                      .div(10000)
                                                : portion
                                                      .mul(props.assets[idx].amount!)
                                                      .div(parseEther('1'))
                                                      .mul(980)
                                                      .div(1000);
                                        });

                                        setAmounts(newAmounts);
                                    }
                                }
                            }}
                            disabled={(props.isMinting && (!pegBalance || pegBalance.isZero())) || !props.fundAsset}
                            size="large"
                        />
                        <Field style={{ position: 'absolute', top: '20px', left: '20px' }}>
                            {props.isMinting ? 'Expected Input' : 'Min Output'}
                        </Field>
                        <TextBold style={{ position: 'absolute', bottom: '20px', right: '20px' }}>BUSD</TextBold>
                    </InputContainer>
                </Col>
                <Col span={12} style={{ alignItems: 'flex-start', paddingLeft: '10px', marginBottom: '10px' }}>
                    <Field>{`Balance: ${pegBalance ? parseBalance(pegBalance) : '0.00'} ${'BUSD'}`}</Field>
                </Col>
            </>
        );

    return (
        <Row>
            <Modal
                style={{ borderRadius: '15px' }}
                title="Confirmation"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={<Filled onClick={handleOk}>{props.isMinting ? 'Mint' : 'Redeem'}</Filled>}
            >
                <p>
                    Autmated minting actually automated the process of swapping for underlying tokens and manually
                    minting a Bundle. For this reason, the input and output amounts may deviate slightly from what's
                    displayed on the UI. Rest assured though, the ratio between BUSD in and {props.fund?.symbol} out
                    won't change.
                </p>
                <p>
                    Automated minting has a limit of <b>1%</b> slippage configured by default.
                </p>
            </Modal>
            <Col span={24} style={{ width: '100%', flexGrow: 1 }}>
                <Card
                    style={{
                        height: mode == MANUAL ? '265px' : 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'space-evenly',
                        padding: '20px 30px',
                        overflowY: mode == AUTO ? 'hidden' : 'scroll',
                        overflowX: 'hidden',
                    }}
                >
                    <Row>
                        <Col span={12} align="flex-end">
                            <Selector
                                selected={mode == AUTO}
                                onClick={() => {
                                    setMode(AUTO);
                                }}
                            >
                                Auto
                            </Selector>
                        </Col>
                        <Col span={12} align="flex-start">
                            <Selector
                                selected={mode == MANUAL}
                                onClick={() => {
                                    setMode(MANUAL);
                                }}
                            >
                                Manual
                            </Selector>
                        </Col>
                    </Row>
                    <Row>{underlying}</Row>
                </Card>
            </Col>
            <Col span={24}>
                <Card
                    style={{
                        height: 'auto',
                        display: 'flex',
                        flexGrow: 1,
                        justifyContent: 'space-evenly',
                        alignItems: 'flex-start',
                        padding: '20px 30px',
                    }}
                >
                    <Row>
                        <Col span={24}>
                            <InputContainer>
                                <InputNumber
                                    style={{
                                        padding: '40px 0px 0px 8px',
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: 'none',
                                    }}
                                    stringMode={true}
                                    min={'0'}
                                    value={formatUnits(fundAmount, 18)}
                                    onChange={(value) => {
                                        const parsedValue = parseEther(value ? value : '0');
                                        fundAdjustAmounts(parsedValue);
                                    }}
                                    disabled={
                                        props.assets.reduce((a: boolean, b: Asset) => {
                                            return a || !b.amount || b.amount?.isZero();
                                        }, false) || !props.fundAsset
                                    }
                                    size="large"
                                />
                                <Field style={{ position: 'absolute', top: '20px', left: '20px' }}>
                                    {props.isMinting ? (mode == MANUAL ? 'Output' : 'Min Output') : 'Input'}
                                </Field>
                                <TextBold style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                                    {props.fund ? props.fund.symbol : '...'}
                                </TextBold>
                            </InputContainer>
                        </Col>
                        <Col span={12} style={{ alignItems: 'flex-start', paddingLeft: '10px', marginBottom: '10px' }}>
                            <Field>{`Balance: ${fundBalance ? parseBalance(fundBalance) : '0.00'} ${
                                props.fund ? props.fund.symbol : '...'
                            }`}</Field>
                        </Col>
                        <Col span={12} style={{ alignItems: 'flex-end', paddingRight: '10px', marginBottom: '10px' }}>
                            <Primary
                                onClick={() => {
                                    if (props.isMinting && mode == MANUAL) {
                                        if (balances && balances.length > 0 && props.fundAsset) {
                                            let min = BigNumber.from(
                                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                                            );
                                            balances.forEach((bal, i) => {
                                                if (props.assets.length > 0) {
                                                    const portion = bal
                                                        .mul(parseEther('1'))
                                                        .div(props.assets[i].amount!);
                                                    const fundAmount = portion
                                                        .mul(props.fundAsset!.cap!)
                                                        .div(parseEther('1'))
                                                        .mul(10000)
                                                        .div(10001);
                                                    if (min.gte(fundAmount)) {
                                                        min = fundAmount;
                                                    }
                                                }
                                            });
                                            fundAdjustAmounts(min);
                                        }
                                    } else if (props.isMinting && mode == AUTO && props.fundAsset) {
                                        fundAdjustAmounts(
                                            pegBalance.mul(props.fundAsset.cap!).mul(9900).div(10000).div(props.nav)
                                        );
                                    } else {
                                        fundAdjustAmounts(fundBalance);
                                    }
                                }}
                            >
                                Max
                            </Primary>
                        </Col>
                        <Col span={24}>
                            <Outline
                                style={{ width: '100%' }}
                                disabled={
                                    (!props.fund ||
                                        fundAmount?.isZero() ||
                                        (props.isMinting &&
                                            mode == MANUAL &&
                                            approvals?.reduce((a, b) => a && !b, true)) ||
                                        (props.isMinting &&
                                            mode == MANUAL &&
                                            balances?.reduce<boolean>(
                                                (a, b, index) => a || !b || !amounts[index] || !amounts[index].lte(b),
                                                false
                                            )) ||
                                        (!props.isMinting &&
                                            (!fundBalance ||
                                                !fundAmount ||
                                                fundAmount.lte(BigNumber.from('0')) ||
                                                !fundAmount.lte(fundBalance))) ||
                                        (props.isMinting && mode == AUTO && pegAmount && !pegAmount.lte(pegBalance)) ||
                                        (!props.isMinting &&
                                            mode == AUTO &&
                                            fundAmount &&
                                            !fundAmount.lte(fundBalance))) &&
                                    ((props.isMinting && ((mode == AUTO && pegApproved) || mode == MANUAL)) ||
                                        (!props.isMinting && ((mode == AUTO && fundApproved) || mode == MANUAL)))
                                }
                                onClick={() => {
                                    if (props.isMinting) {
                                        if (mode == AUTO && !pegApproved) {
                                            pegContract
                                                ?.approve(
                                                    BUNDLE_ROUTER,
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
                                        } else if (mode == AUTO) {
                                            setIsModalVisible(true);
                                        } else {
                                            fundContract
                                                ?.joinPool(fundAmount, amounts)
                                                .then((tx: TransactionResponse) => {
                                                    txMessage(tx);
                                                    return tx.wait(1);
                                                })
                                                .then((tx: TransactionReceipt) => {
                                                    mintMessage(tx);
                                                })
                                                .catch((e: any) => {
                                                    errorMessage(e.message || e.data.message);
                                                });
                                        }
                                    } else {
                                        if (mode == AUTO && !fundApproved) {
                                            fundContract
                                                ?.approve(
                                                    BUNDLE_ROUTER,
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
                                        } else if (mode == AUTO) {
                                            setIsModalVisible(true);
                                        } else {
                                            fundContract
                                                ?.exitPool(
                                                    fundAmount,
                                                    amounts.map((amount) => amount.mul(970).div(1000))
                                                )
                                                .then((tx: TransactionResponse) => {
                                                    txMessage(tx);
                                                    return tx.wait(1);
                                                })
                                                .then((tx: TransactionReceipt) => {
                                                    burnMessage(tx);
                                                })
                                                .catch((e: any) => {
                                                    errorMessage(e.message || e.data.message);
                                                });
                                        }
                                    }
                                }}
                            >
                                {props.isMinting
                                    ? mode == AUTO && !pegApproved
                                        ? 'Approve'
                                        : 'Mint'
                                    : mode == AUTO && !fundApproved
                                    ? 'Approve'
                                    : 'Redeem'}
                            </Outline>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default Flow;
