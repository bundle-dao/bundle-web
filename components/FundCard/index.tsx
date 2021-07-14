import styled from 'styled-components';
import React from 'react';
import { Col, Row } from '../Layout';
import { Fund } from '../../lib/fund';
import Link from 'next/link';

interface Props {
    index: number;
    fund: Fund;
    priceChange: string;
    marketCap: string;
    price: string;
}

interface CardProps {
    index: number;
}

interface AssetProps {
    index: number;
}

const ImageContainer = styled.div<AssetProps>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 2px 2px 4px #00000025;
    margin-left: ${(props) => (props.index == 0 ? '0px' : '-15px')};
    z-index: ${(props) => 10 - props.index};
    background-color: ${(props) => props.theme.white};
    overflow: hidden;
`;

const CardRow = styled(Row)<CardProps>`
    background-color: ${(props) => (props.index % 2 == 0 ? props.theme.white : props.theme.spaceGrey)};
    min-height: 70px;
    overflow: hidden;

    &:hover {
        cursor: pointer;

        * {
            transform: scale(1.05);
        }
    }

    * {
        transition: transform 0.2s;
    }
`;

const Text = styled.div`
    font-size: 16px;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const TextBold = styled.div`
    font-size: 16px;
    font-weight: bold;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const Field = styled.span`
    color: ${(props) => props.theme.grey};
    font-size: 0px;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

const FundCard: React.FC<Props> = (props: Props): React.ReactElement => {
    const assets = [];

    for (let i = 0; i < Math.min(props.fund.assets.length, 6); i++) {
        if (i == 5 && props.fund.assets.length > 6) {
            assets.push(
                <span style={{ fontSize: '14px', paddingLeft: '5px' }}>{`+${props.fund.assets.length - i}`}</span>
            );
        } else {
            assets.push(
                <ImageContainer key={i} index={i}>
                    <img src={`/assets/${props.fund.assets[i]}.png`} width="40px" height="40px" />
                </ImageContainer>
            );
        }
    }

    return (
        <Link href={`/funds/${props.fund.symbol}`}>
            <CardRow index={props.index}>
                <Col
                    xs={24}
                    md={5}
                    justify="flex-start"
                    mobilePadding="20px 0px 20px 0px"
                    style={{ flexDirection: 'row' }}
                >
                    <img src="/assets/logo.svg" width="40px" height="40px" style={{ margin: '0px 5px 0px 20px' }} />
                    <TextBold>{props.fund.name}</TextBold>
                </Col>
                <Col
                    xs={24}
                    md={9}
                    mobilePadding="0px 0px 20px 0px"
                    style={{ flexDirection: 'row' }}
                    hideOnMobile={true}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{assets}</div>
                </Col>
                <Col xs={8} md={3} mobilePadding="0px 0px 20px 0px">
                    <Field>24H</Field>
                    <Text>{props.priceChange}</Text>
                </Col>
                <Col xs={8} md={4} mobilePadding="0px 0px 20px 0px">
                    <Field>Market Cap</Field>
                    <Text>{`$${props.marketCap}`}</Text>
                </Col>
                <Col xs={8} md={3} mobilePadding="0px 0px 20px 0px">
                    <Field>Price</Field>
                    <Text>{`$${props.price}`}</Text>
                </Col>
            </CardRow>
        </Link>
    );
};

export default FundCard;
