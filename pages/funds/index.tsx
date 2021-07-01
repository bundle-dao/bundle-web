import { Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';
import FundCard from '../../components/FundCard';
import { RowContainer, Row, Col } from '../../components/Layout';
import { getFundByName } from '../../lib/fund';

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

const Landing: React.FC = (): React.ReactElement => {
    return (
        <Layout.Content>
            <RowContainer style={{flexDirection: "column"}}>
                <Row>
                    <Col span={24} style={{alignItems: "flex-start"}}>
                        <h2 style={{marginBottom: "0px"}}>
                            Available Bundles
                        </h2>
                        <span style={{marginBottom: "30px"}}>
                            Passively managed, non-custodial crypto-funds.
                        </span>
                    </Col>
                </Row>
                <Row hideOnMobile={true}>
                    <Col xs={5} md={5} style={{alignItems: "flex-start"}}>
                        <Field style={{ paddingLeft: '10px'}}>
                            Name
                        </Field>
                    </Col>
                    <Col xs={9} md={9}>
                        <Field>
                            Assets
                        </Field>
                    </Col>
                    <Col xs={3} md={3}>
                        <Field>
                            24H
                        </Field>
                    </Col>
                    <Col xs={4} md={4}>
                        <Field>
                            Market Cap
                        </Field>
                    </Col>
                    <Col xs={3} md={3}>
                        <Field>
                            Price
                        </Field>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} mobilePadding="0px">
                        <FundContainer>
                            <FundCard
                                index={0}
                                price={'1.25'}
                                fund={getFundByName('TEST')!}
                                priceChange={'+3.65%'}
                                marketCap={'39,227,502'}
                            />
                            <FundCard
                                index={1}
                                price={'1.25'}
                                fund={getFundByName('TST2')!}
                                priceChange={'-3.65%'}
                                marketCap={'39,227,502'}
                            />
                            <FundCard
                                index={2}
                                price={'1.25'}
                                fund={getFundByName('TST3')!}
                                priceChange={'-3.65%'}
                                marketCap={'39,227,502'}
                            />
                        </FundContainer>
                    </Col>
                </Row>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
