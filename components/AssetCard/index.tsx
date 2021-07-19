import { Asset } from '../../lib/asset';
import React from 'react';
import { Col, Row } from '../Layout';
import Card from '../Card';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { parseBalance } from '../../util';
import { parseEther } from '@ethersproject/units';

interface Props {
    asset: Asset;
    nav: BigNumber;
    index: number;
}

interface ProgressBarProps {
    progress: number;
}

const ImageContainer = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 2px 2px 4px #00000025;
    background-color: ${(props) => props.theme.white};
    overflow: hidden;
`;

const Text = styled.div`
    font-size: 16px;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const ProgressBarContainer = styled.div`
    width: 90%;
    height: 20px;
    border-radius: 6px;
    background-color: ${(props) => props.theme.spaceGrey};
    overflow: hidden;
`;

const Progress = styled.div<ProgressBarProps>`
    width: ${(props) => `${props.progress}%`};
    height: 100%;
    background-color: ${(props) => props.theme.primary};
`;

const ProgressBar: React.FC<ProgressBarProps> = (props: ProgressBarProps): React.ReactElement => {
    return (
        <ProgressBarContainer>
            <Progress progress={props.progress} />
        </ProgressBarContainer>
    );
};

const AssetCard: React.FC<Props> = (props: Props): React.ReactElement => {
    return (
        <Col xs={24} md={12} padding={props.index % 2 == 0 ? '0px 15px 0px 0px' : '0px'} mobilePadding="0px">
            <Card style={{ height: '40px' }}>
                <Row>
                    <Col xs={4} lg={3} style={{ alignItems: 'flex-start' }}>
                        <ImageContainer style={{ margin: '-5px 0px 0px -3px', alignItems: 'flex-start' }}>
                            <img src={`/assets/${props.asset.symbol.toUpperCase()}.png`} width="50px" height="50px" />
                        </ImageContainer>
                    </Col>
                    <Col xs={5} md={4} lg={4} style={{ alignItems: 'flex-start' }}>
                        <Text>{props.asset.symbol.toUpperCase()}</Text>
                    </Col>
                    <Col xs={9} md={9} lg={9} style={{ alignItems: 'flex-start' }}>
                        <Text>{`$${parseBalance(props.asset.price!, 18, 2, false)}`}</Text>
                    </Col>
                    <Col xs={0} md={0} lg={3} style={{ alignItems: 'center' }}>
                        <ProgressBar
                            progress={Math.round(
                                props.asset.amount
                                    ?.mul(props.asset.price!)
                                    .div(parseEther('1'))
                                    .div('10000000000000')
                                    .toNumber()! / props.nav.div('1000000000000000').toNumber()!
                            )}
                        />
                    </Col>
                    <Col xs={4} md={4} lg={5} style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#E7694C' }}>{`${
                            Math.round(
                                props.asset.amount
                                    ?.mul(props.asset.price!)
                                    .div(parseEther('1'))
                                    .div('100000000000')
                                    .toNumber()! / props.nav.div('1000000000000000').toNumber()!
                            ) / 100
                        }%`}</Text>
                    </Col>
                </Row>
            </Card>
        </Col>
    );
};

export default AssetCard;
