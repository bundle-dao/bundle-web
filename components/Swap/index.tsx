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
import { Asset, getPairAmounts, ROUTER } from '../../lib/asset';
import { Fund } from '../../lib/fund';
import { parseBalance } from '../../util';
import Outline from '../Button/Outline';
import Card from '../Card';
import { Col, Row } from '../Layout';
import { approveMessage, errorMessage, swapMessage, txMessage } from '../Messages';
import { Token, Pair, TokenAmount, Price, CurrencyAmount, Percent, Fraction } from '@pancakeswap/sdk';
import { useWeb3React } from '@web3-react/core';
import useToken from '../../hooks/pcs';
import useContract from '../../hooks/useContract';
import PancakeRouter from '../../contracts/PancakeRouter.json';

interface Props {
    fund: Fund | undefined;
    assets: Asset[];
    account: string | undefined | null;
    disabled?: boolean;
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

const PriceImpact = styled.span`
    color: ${(props) => props.theme.primary};
`;

const Field = styled.span`
    color: ${(props) => props.theme.grey};
`;

const computePriceImpact = (midPrice: Price, inputAmount: TokenAmount, outputAmount: TokenAmount): Percent => {
    const exactQuote = midPrice.raw.multiply(inputAmount.raw);
    // calculate slippage := (exactQuote - outputAmount) / exactQuote
    const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote);
    return new Percent(slippage.numerator, slippage.denominator);
};

const BUY = 'BUY';
const SELL = 'SELL';

const Swap: React.FC<Props> = (props: Props): React.ReactElement => {
    const { account, chainId, library } = useWeb3React();
    const [selected, setSelected] = useState(BUY);
    const [asset, setAsset] = useState(props.assets[0]);
    const [assetAmount, setAssetAmount] = useState(BigNumber.from(0));
    const [fundAmount, setFundAmount] = useState(BigNumber.from(0));
    const [priceImpact, setPriceImpact] = useState(new Percent('0', '100'));

    const router = useContract(ROUTER, PancakeRouter, true);

    const assetContract = useERC20Contract(asset.address, true);
    const assetBalance = useRawBalance(assetContract).data;

    const fundContract = useERC20Contract(props.fund ? props.fund.address : undefined, true);
    const fundBalance = useRawBalance(fundContract).data;
    const assetApproved = useApproved(assetContract, ROUTER).data;
    const fundApproved = useApproved(fundContract, ROUTER).data;

    // PCS data
    const token: Token | undefined = useToken(chainId, asset);
    const fundToken: Token | undefined = useToken(chainId, props.fund);
    const [pair, setPair] = useState<Pair>();
    const [basePair, setBasePair] = useState<Pair>();

    const threshold = new Fraction('5', '100');
    const minThreshold = new Fraction('1', '10000');

    useEffect(() => {
        getPairAmounts(token, fundToken, library, chainId).then((amounts: TokenAmount[]) => {
            if (token && fundToken && amounts.length == 2) {
                const pair = new Pair(amounts[0], amounts[1]);
                setBasePair(new Pair(amounts[0], amounts[1]));
                setPair(new Pair(amounts[0], amounts[1]));
            }
        });
    }, [token, fundToken, library]);

    return (
        <Col span={24} style={{ width: '100%', flexGrow: 1 }}>
            <Card
                style={{
                    minHeight: '480px',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'flex-start',
                    padding: '20px 30px',
                }}
            >
                <Col span={24}>
                    <Row style={{ display: 'flex', justifyContent: 'center' }}>
                        <Selector
                            onClick={() => {
                                setSelected(BUY);
                            }}
                            selected={selected == BUY}
                        >
                            Buy
                        </Selector>
                        <Selector
                            onClick={() => {
                                setSelected(SELL);
                            }}
                            selected={selected == SELL}
                        >
                            Sell
                        </Selector>
                    </Row>
                    <Row>
                        <Col span={24} order={selected == BUY ? 0 : 4}>
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
                                    value={formatUnits(assetAmount, 18)}
                                    onChange={(value) => {
                                        try {
                                            value = value ? value : '0';
                                            setAssetAmount(parseEther(value));
                                            const tokenAmountIn = new TokenAmount(token!, parseEther(value).toString());

                                            if (basePair && selected == BUY) {
                                                const [tokenOut, pairOut] = basePair.getOutputAmount(tokenAmountIn);
                                                const price =
                                                    basePair.token0.symbol == asset.symbol
                                                        ? basePair?.token0Price
                                                        : basePair?.token1Price;
                                                setFundAmount(BigNumber.from(tokenOut.numerator.toString()));
                                                setPair(pairOut);
                                                setPriceImpact(computePriceImpact(price, tokenAmountIn, tokenOut));
                                            } else if (basePair && selected == SELL) {
                                                const [tokenOut, pairOut] = basePair.getInputAmount(tokenAmountIn);
                                                const price =
                                                    basePair.token1.symbol == asset.symbol
                                                        ? basePair?.token0Price
                                                        : basePair?.token1Price;
                                                setFundAmount(BigNumber.from(tokenOut.numerator.toString()));
                                                setPair(pairOut);
                                                setPriceImpact(computePriceImpact(price, tokenOut, tokenAmountIn));
                                            } else {
                                                setFundAmount(parseEther('0'));
                                                setPriceImpact(new Percent('0', '100'));
                                            }

                                            setAssetAmount(parseEther(value));
                                        } catch (e) {
                                            setFundAmount(parseEther('0'));
                                            setPriceImpact(new Percent('0', '100'));
                                        }
                                    }}
                                    disabled={
                                        props.disabled ||
                                        (assetBalance <= BigNumber.from(0) && selected == BUY) ||
                                        !props.account ||
                                        !pair
                                    }
                                    size="large"
                                />
                                <Field style={{ position: 'absolute', top: '20px', left: '20px' }}>
                                    {selected == BUY ? 'From' : 'To'}
                                </Field>
                                <TextBold style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                                    {asset ? asset.symbol : '...'}
                                </TextBold>
                            </InputContainer>
                        </Col>
                        <Col
                            span={24}
                            order={selected == BUY ? 1 : 4}
                            style={{ alignItems: 'flex-start', paddingLeft: '15px', marginBottom: '5px' }}
                        >
                            <Field>{`Balance: ${assetBalance ? parseBalance(assetBalance) : '0.00'} ${
                                asset.symbol
                            }`}</Field>
                        </Col>
                        <Col span={24} order={2}>
                            <ArrowDownOutlined style={{ fontSize: '25px' }} />
                        </Col>
                        <Col span={24} order={selected == BUY ? 3 : 0}>
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
                                        try {
                                            value = value ? value : '0';
                                            setFundAmount(parseEther(value));
                                            const tokenAmountIn = new TokenAmount(
                                                fundToken!,
                                                parseEther(value).toString()
                                            );

                                            if (basePair && selected == SELL) {
                                                const [tokenOut, pairOut] = basePair.getOutputAmount(tokenAmountIn);
                                                const price =
                                                    basePair.token0.symbol == fundToken?.symbol
                                                        ? basePair?.token0Price
                                                        : basePair?.token1Price;
                                                setAssetAmount(BigNumber.from(tokenOut.numerator.toString()));
                                                setPair(pairOut);
                                                setPriceImpact(computePriceImpact(price, tokenAmountIn, tokenOut));
                                            } else if (basePair && selected == BUY) {
                                                const [tokenOut, pairOut] = basePair.getInputAmount(tokenAmountIn);
                                                const price =
                                                    basePair.token1.symbol == fundToken?.symbol
                                                        ? basePair?.token0Price
                                                        : basePair?.token1Price;
                                                setAssetAmount(BigNumber.from(tokenOut.numerator.toString()));
                                                setPair(pairOut);
                                                setPriceImpact(computePriceImpact(price, tokenOut, tokenAmountIn));
                                            } else {
                                                setAssetAmount(parseEther('0'));
                                                setPriceImpact(new Percent('0', '100'));
                                            }
                                        } catch (e) {
                                            setAssetAmount(parseEther('0'));
                                            setPriceImpact(new Percent('0', '100'));
                                        }
                                    }}
                                    disabled={
                                        props.disabled ||
                                        (fundBalance <= BigNumber.from(0) && selected == SELL) ||
                                        !props.account ||
                                        !props.fund
                                    }
                                    size="large"
                                />
                                <Field style={{ position: 'absolute', top: '20px', left: '20px' }}>
                                    {selected == BUY ? 'To' : 'From'}
                                </Field>
                                <TextBold style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                                    {props.fund ? props.fund.symbol : '...'}
                                </TextBold>
                            </InputContainer>
                        </Col>
                        <Col
                            span={24}
                            order={selected == BUY ? 4 : 1}
                            style={{ alignItems: 'flex-start', paddingLeft: '15px', marginBottom: '5px' }}
                        >
                            <Field>{`Balance: ${fundBalance ? parseBalance(fundBalance) : '0.00'} ${
                                props.fund ? props.fund.symbol : '...'
                            }`}</Field>
                        </Col>
                    </Row>
                    {priceImpact.toFixed(2) == '0.00' || priceImpact.greaterThan(threshold) ? (
                        <></>
                    ) : (
                        <Row style={{ paddingTop: '15px', display: 'flex', justifyContent: 'center' }}>
                            <PriceImpact>{`Fee + Price Impact: ${
                                priceImpact.lessThan(minThreshold) ? '<0.01' : priceImpact.toFixed(2)
                            }%`}</PriceImpact>
                        </Row>
                    )}
                    <Row style={{ paddingTop: '15px', display: 'flex', justifyContent: 'center' }}>
                        <Outline
                            style={{ width: '100%' }}
                            disabled={
                                !fundToken ||
                                !router ||
                                !token ||
                                !account ||
                                priceImpact.greaterThan(threshold) ||
                                (selected == BUY && assetAmount.lte(BigNumber.from('0'))) ||
                                (selected == SELL && fundAmount.lte(BigNumber.from('0'))) ||
                                (selected == BUY && !assetAmount.lte(assetAmount)) ||
                                (selected == SELL && !fundAmount.lte(fundBalance))
                            }
                            onClick={() => {
                                if (selected == BUY && assetApproved) {
                                    router
                                        ?.swapExactTokensForTokens(
                                            assetAmount,
                                            fundAmount.mul(98).div(100),
                                            [token?.address, fundToken?.address],
                                            account,
                                            `0x${(Math.floor(new Date().getTime() / 1000) + 600).toString(16)}`
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            swapMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                } else if (selected == SELL && fundApproved) {
                                    router
                                        ?.swapExactTokensForTokens(
                                            fundAmount,
                                            assetAmount.mul(98).div(100),
                                            [fundToken?.address, token?.address],
                                            account,
                                            `0x${(Math.floor(new Date().getTime() / 1000) + 600).toString(16)}`
                                        )
                                        .then((tx: TransactionResponse) => {
                                            txMessage(tx);
                                            return tx.wait(1);
                                        })
                                        .then((tx: TransactionReceipt) => {
                                            swapMessage(tx);
                                        })
                                        .catch((e: any) => {
                                            errorMessage(e.data.message);
                                        });
                                } else {
                                    if (selected == BUY) {
                                        assetContract
                                            ?.approve(
                                                ROUTER,
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
                                                errorMessage(e.data.message);
                                            });
                                    } else {
                                        fundContract
                                            ?.approve(
                                                ROUTER,
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
                                                errorMessage(e.data.message);
                                            });
                                    }
                                }
                            }}
                        >
                            {selected == BUY && assetApproved
                                ? 'Swap'
                                : selected == SELL && fundApproved
                                ? 'Swap'
                                : 'Approve'}
                        </Outline>
                    </Row>
                </Col>
            </Card>
        </Col>
    );
};

export default Swap;
