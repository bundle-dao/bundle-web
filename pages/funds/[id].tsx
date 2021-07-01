import { Layout } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowLeftOutlined, RocketOutlined } from '@ant-design/icons';
import { RowContainer, Row, Col } from '../../components/Layout';
import { getAssets, getFundByName, Fund } from '../../lib/fund';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Card from '../../components/Card';
import { useWeb3React } from '@web3-react/core';
import AssetCard from '../../components/AssetCard';
import { BigNumber } from '@ethersproject/bignumber';
import { Asset } from '../../lib/asset';
import { parseBalance } from '../../util';
import { parseEther } from '@ethersproject/units';
import Swap from '../../components/Swap';

interface SelectorProps {
    selected: boolean;
}

const Field = styled.span`
    color: ${(props) => props.theme.grey};
`;

const Text = styled.div`
    font-size: 16px;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const Selector = styled.div<SelectorProps>`
    font-size: 16px;
    font-family: 'Visuelt';
    padding: ${props => props.selected ? '10px 0px 10px 0px' : '13px 0px'};
    margin: 3px 10px 0px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.selected ? props.theme.primary : props.theme.black};
    border-bottom: ${props => props.selected ? '3px solid ' + props.theme.primary : ''};
    width: 20%;
    
    &:hover {
        cursor: pointer;
        color: ${props => props.theme.primary};
        border-bottom: 3px solid ${props => props.theme.primary};
        padding: 10px 0px 10px 0px;
    }

    transition: color 100ms linear, border-bottom 100ms linear, padding 100ms ease, margin 100ms ease;
`;

const TRADE = 'TRADE';
const MINT = 'MINT';
const BURN = 'BURN';

const Landing: React.FC = (): React.ReactElement => {
    const { library } = useWeb3React();
    const router = useRouter();
    const [fund, setFund] = useState<Fund>();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selected, setSelected] = useState(TRADE);
    const selectorOnClick = (target: string) => {
        return () => {
            setSelected(target);
        }
    }

    const price = '1.25';
    const priceChange = '+3.65%';
    const marketCap = '39,227,502';
    const nav = assets.reduce((a: BigNumber, b: Asset) => a.add(b.amount!.mul(b.price!).div(parseEther('1'))), BigNumber.from(0));

    useEffect(() => {
        if (router.isReady) {
            setFund(getFundByName(router.query.id as string));
        }
    }, [router]);

    useEffect(() => {
        getAssets(fund, library, setAssets);
    }, [fund, library]);

    const assetCards = assets.map(asset => 
        <AssetCard asset={asset} nav={nav} />
    );

    return (
        <Layout.Content>
            <RowContainer style={{flexDirection: "column"}}>
                <Row style={{paddingBottom: '15px'}}>
                    <Col xs={4} md={2} hideOnMobile={true}>
                        <Link href="/funds">
                            <ArrowLeftOutlined style={{ fontSize: '25px' }} />
                        </Link>
                    </Col>
                    <Col xs={{span: 22, push: 1}} md={{span: 9, push: 0}} style={{alignItems: 'flex-start'}}>
                        <h2 style={{marginBottom: "0px"}}>
                            { fund ? fund.name : '...' }
                        </h2>
                        <span style={{marginBottom: "0px"}}>
                            { fund ? fund.description : '...' }
                        </span>
                    </Col>
                    <Col xs={12} md={3} style={{justifyContent: 'flex-end'}} mobilePadding='15px 0px 0px 0px'>
                        <Field>
                            Price
                        </Field>
                        <Text>
                            { `$${price}` }
                        </Text>
                    </Col>
                    <Col xs={12} md={3} style={{justifyContent: 'flex-end'}} mobilePadding='15px 0px 0px 0px'>
                        <Field>
                            24H
                        </Field>
                        <Text style={{color: priceChange.startsWith('+') ? "green" : "red"}}>
                            {priceChange}
                        </Text>
                    </Col>
                    <Col xs={12} md={4} style={{justifyContent: 'flex-end'}} mobilePadding='15px 0px 0px 0px'>
                        <Field>
                            Market Cap
                        </Field>
                        <Text>
                            { `$${marketCap}` }
                        </Text>
                    </Col>
                    <Col xs={12} md={3} style={{justifyContent: 'flex-end'}} mobilePadding='15px 0px 0px 0px'>
                        <Field>
                            NAV
                        </Field>
                        <Text>
                            { `$${parseBalance(nav)}` }
                        </Text>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{order: 2, span: 24}} lg={{order: 1, span: 16}} style={{justifyContent: 'flex-start'}}>
                        <Row>
                            <Col span={24} style={{paddingRight: '15px'}}>
                                <Card style={{height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                    <RocketOutlined style={{fontSize: '50px', paddingBottom: '25px'}} />
                                    <h2>
                                        Charting is currently under construction.
                                    </h2>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            { assetCards }
                        </Row>
                    </Col>
                    <Col xs={{order: 1, span: 24}} lg={{order: 2, span: 8}} style={{justifyContent: 'flex-start'}}>
                        <Row>
                            <Col span={24} style={{width: '100%'}}>
                                <Card style={{height: '60px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-end'}}>
                                    <Selector onClick={selectorOnClick(TRADE)} selected={selected == TRADE}>Trade</Selector>
                                    <Selector onClick={selectorOnClick(MINT)} selected={selected == MINT}>Mint</Selector>
                                    <Selector onClick={selectorOnClick(BURN)} selected={selected == BURN}>Burn</Selector>
                                </Card>
                            </Col>
                            <Swap />
                        </Row>
                    </Col>
                </Row>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;