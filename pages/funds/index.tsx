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

const FUNDS = ['bDEFI', 'bCHAIN', 'bSTBL'];

const Landing: React.FC = (): React.ReactElement => {
    const { library } = useWeb3React();

    const funds: Fund[] = [];
    const [fundAssets, setFundAssets] = useState<{ [key: string]: Asset }>({});

    FUNDS.forEach((fund) => {
        funds.push(getFundByName(fund)!);
    });

    useEffect(() => {
        const fetchPromises: Promise<any>[] = [];

        funds.forEach((fund) => {
            fetchPromises.push(getAsset(fund.address, library, undefined, true));
        });

        console.log(fetchPromises);
        console.log(funds);

        Promise.all(fetchPromises).then((values) => {
            const newFundAssets: { [key: string]: Asset } = {};

            values.forEach((value) => {
                newFundAssets[value.symbol] = value;
            });

            setFundAssets(newFundAssets);
        });
    }, [library]);

    const fundCards: React.ReactElement[] = [];
    funds.forEach((fund, index) => {
        fundCards.push(
            <FundCard
                index={index}
                price={fundAssets[fund.symbol] ? parseBalance(fundAssets[fund.symbol].price!, 18, 2, false) : '0.00'}
                fund={fund}
                priceChange={'N/A'}
                marketCap={
                    fundAssets[fund.symbol]
                        ? parseBalance(
                              fundAssets[fund.symbol].price!.mul(fundAssets[fund.symbol].cap!).div(parseEther('1')),
                              18,
                              2,
                              false
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
                        <FundContainer>{fundCards}</FundContainer>
                    </Col>
                </Row>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
