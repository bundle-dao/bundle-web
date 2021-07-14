import { ArrowDownOutlined } from '@ant-design/icons';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { formatUnits, parseEther } from '@ethersproject/units';
import { InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useApproved from '../../hooks/useApproved';
import useERC20Contract from '../../hooks/useERC20Contract';
import useRawBalance from '../../hooks/useRawBalance';
import { Asset } from '../../lib/asset';
import { Fund, getAssets } from '../../lib/fund';
import Outline from '../Button/Outline';
import Card from '../Card';
import { Col, Row } from '../Layout';
import { approveMessage, burnMessage, errorMessage, mintMessage, txMessage } from '../Messages';
import { useWeb3React } from '@web3-react/core';
import Underlying from './subcomponents/Underlying.tsx';
import useContract from '../../hooks/useContract';
import Bundle from '../../contracts/Bundle.json';
import useBalance from '../../hooks/useBalance';
import { parseBalance } from '../../util';
import { Contract } from '@ethersproject/contracts';

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

export const MINT = 'MINT';
export const BURN = 'BURN';

const Flow: React.FC<Props> = (props: Props): React.ReactElement => {
    const [amounts, setAmounts] = useState(Array(props.assets.length).fill(BigNumber.from('0')));
    const [fundAmount, setFundAmount] = useState(BigNumber.from('0'));
    const [disabled, setDisabled] = useState(false);

    const approvals: (boolean | undefined)[] = [];
    const balances: (BigNumber | undefined)[] = [];

    props.assets.forEach((asset) => {
        const assetContract = useERC20Contract(asset.address, true);
        approvals.push(useApproved(assetContract, props.fund?.address).data);
        balances.push(useRawBalance(assetContract).data);
    });

    const fundContract = useContract(props.fund?.address, Bundle, true);
    const fundBalance = useRawBalance(fundContract).data;

    useEffect(() => {
        setAmounts(Array(props.assets.length).fill(BigNumber.from('0')));
        setFundAmount(BigNumber.from('0'));
    }, [props.isMinting]);

    const underlying = props.assets.map((asset, index) => {
        return (
            <Underlying
                key={asset.symbol + '_underlying'}
                asset={asset}
                isMinting={props.isMinting}
                value={amounts[index]}
                fund={props.fund}
                approved={approvals[index]}
                balance={balances[index]}
                disabled={
                    props.assets.reduce((a: boolean, b: Asset) => {
                        return a || !b.amount || b.amount?.isZero();
                    }, false) ||
                    !props.fundAsset ||
                    true
                }
                setValue={(value: BigNumber) => {
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
    });

    return (
        <Row>
            <Col span={24} style={{ width: '100%', flexGrow: 1 }}>
                <Card
                    style={{
                        height: '227.5px',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        alignItems: 'flex-start',
                        padding: '20px 30px',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                    }}
                >
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
                                        setFundAmount(parsedValue);

                                        if (props.fundAsset && props.assets.length > 0) {
                                            const newAmounts = [...amounts];
                                            const portion = parsedValue.mul(parseEther('1')).div(props.fundAsset.cap!);

                                            newAmounts.forEach((_, idx) => {
                                                newAmounts[idx] = props.isMinting
                                                    ? portion.mul(props.assets[idx].amount!).div(parseEther('1')).mul(10001).div(10000)
                                                    : portion
                                                          .mul(props.assets[idx].amount!)
                                                          .div(parseEther('1'))
                                                          .mul(980)
                                                          .div(1000);
                                            });

                                            setAmounts(newAmounts);
                                        }
                                    }}
                                    disabled={
                                        props.assets.reduce((a: boolean, b: Asset) => {
                                            return a || !b.amount || b.amount?.isZero();
                                        }, false) || !props.fundAsset
                                    }
                                    size="large"
                                />
                                <Field style={{ position: 'absolute', top: '20px', left: '20px' }}>
                                    {props.isMinting ? 'To' : 'From'}
                                </Field>
                                <TextBold style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                                    {props.fund ? props.fund.symbol : '...'}
                                </TextBold>
                            </InputContainer>
                        </Col>
                        <Col span={24} style={{ alignItems: 'flex-start', paddingLeft: '10px', marginBottom: '10px' }}>
                            <Field>{`Balance: ${fundBalance ? parseBalance(fundBalance) : '0.00'} ${
                                props.fund ? props.fund.symbol : '...'
                            }`}</Field>
                        </Col>
                        <Col span={24}>
                            <Outline
                                style={{ width: '100%' }}
                                disabled={
                                    !props.fund ||
                                    fundAmount.isZero() ||
                                    (props.isMinting && approvals.reduce((a, b) => a && !b, true)) ||
                                    (props.isMinting &&
                                        balances.reduce(
                                            (a: boolean, b: BigNumber | undefined, index: number) =>
                                                a || !b || !amounts[index] || !amounts[index].lte(b),
                                            false
                                        )) ||
                                    (!props.isMinting &&
                                        (!fundBalance ||
                                            fundAmount.lte(BigNumber.from('0')) ||
                                            !fundAmount.lte(fundBalance)))
                                }
                                onClick={() => {
                                    if (props.isMinting) {
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
                                }}
                            >
                                {props.isMinting ? 'Mint' : 'Redeem'}
                            </Outline>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default Flow;
