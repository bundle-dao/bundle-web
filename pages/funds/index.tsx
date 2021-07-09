import { RocketOutlined } from '@ant-design/icons';
import { parseEther } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FundCard from '../../components/FundCard';
import { RowContainer, Row, Col } from '../../components/Layout';
import { Asset, getAsset } from '../../lib/asset';
import { Fund, getFundByName } from '../../lib/fund';
import { parseBalance } from '../../util';

const FundContainer = styled.div`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.theme.white};
    box-shadow: 0px 2px 4px #0000004d;
    margin: 10px 0px;
    overflow: hidden;
`;

const Field = styled.span`
    color: ${(props) => props.theme.grey};
`;

const FUNDS: string[] = [];

const Landing: React.FC = (): React.ReactElement => {
    const { library } = useWeb3React();

    const funds: Fund[] = [];
    const [fundAssets, setFundAssets] = useState<Record<string, Asset>>({});

    const setFundAsset = (asset: Asset) => {
        setFundAssets({ ...fundAssets, [asset.symbol]: asset });
    };

    FUNDS.forEach((fund) => {
        funds.push(getFundByName(fund)!);
    });

    useEffect(() => {
        funds.forEach((fund) => {
            getAsset(fund.address, library, setFundAsset, true);
        });
    }, [library]);

    const fundCards: React.ReactElement[] = [];
    funds.forEach((fund, index) => {
        fundCards.push(
            <FundCard
                index={index}
                price={fundAssets[fund.symbol] ? parseBalance(fundAssets[fund.symbol].price!) : '0.00'}
                fund={fund}
                priceChange={'N/A'}
                marketCap={
                    fundAssets[fund.symbol]
                        ? parseBalance(
                              fundAssets[fund.symbol].price!.mul(fundAssets[fund.symbol].cap!).div(parseEther('1'))
                          )
                        : '0.00'
                }
            />
        );
    });

    return (
        <Layout.Content>
            <RowContainer style={{ flexDirection: 'column' }}>
                <Row>
                    <Col span={24} style={{ alignItems: 'flex-start' }}>
                        <h2 style={{ marginBottom: '0px' }}>Available Bundles</h2>
                        <span style={{ marginBottom: '30px' }}>Passively managed, non-custodial crypto-funds.</span>
                    </Col>
                </Row>
                <Row hideOnMobile={true}>
                    <Col xs={5} md={5} style={{ alignItems: 'flex-start' }}>
                        <Field style={{ paddingLeft: '10px' }}>Name</Field>
                    </Col>
                    <Col xs={9} md={9}>
                        <Field>Assets</Field>
                    </Col>
                    <Col xs={3} md={3}>
                        <Field>24H</Field>
                    </Col>
                    <Col xs={4} md={4}>
                        <Field>Market Cap</Field>
                    </Col>
                    <Col xs={3} md={3}>
                        <Field>Price</Field>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} mobilePadding="0px">
                        <FundContainer>
                            <div
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '20px 20px',
                                }}
                            >
                                <RocketOutlined style={{ fontSize: '50px', paddingRight: '25px' }} />
                                <h2 style={{ margin: '0px' }}>Coming soon, funds under construction!</h2>
                            </div>
                        </FundContainer>
                    </Col>
                </Row>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
