import { Col, Image, Row, Menu, Layout } from 'antd';
import styled from 'styled-components';
import React from 'react';

interface Props {
    image: string;
    imageSecondary?: string;
    name: string;
    ticker: string;
    apy: string;
    width?: string;
    cardStyle?: React.CSSProperties;
    imgStyle?: React.CSSProperties;
}

interface CardProps {
    width?: string;
}

const Card = styled.div<CardProps>`
    width: ${(props) => (props.width ? props.width : '100%')};
    height: 75px;
    background-color: ${(props) => props.theme.spaceGrey};
    padding-left: 10px;
    margin: 10px;

    h1 {
        font-size: 15px;
        transition: 0.25s font-size;
    }

    p {
        font-size: 12px;
        margin: 0px !important;
        transition: 0.25s font-size;
        color: ${(props) => props.theme.darkGrey};
    }

    &:hover {
        h1 {
            font-size: 17px;
        }

        p {
            font-size: 14px;
        }

        background-color: ${(props) => props.theme.primary};
        padding-left: 20px;
        transition: 0.25s padding-left;
    }

    cursor: pointer;

    border-radius: 15px;
    box-shadow: 2px 2px 4px #00000012;
    overflow: hidden;
    transition: 0.25s padding-left;
`;

const InternalCard = styled.div`
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.white};
    border-radius: 15px;
    padding: 10px 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const ImageContainer = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 2px 2px 5px #00000012;
    z-index: 2;
    background-color: ${(props) => props.theme.white};
`;

const PrimaryHeader = styled.h1`
    color: ${(props) => props.theme.primary};
`;

const RewardCard: React.FC<Props> = (props: Props): React.ReactElement => {
    return (
        <Card width={props.width} style={props.cardStyle}>
            <InternalCard>
                <div style={{ display: 'flex' }}>
                    <ImageContainer>
                        <img src={props.image} width="50px" height="50px" style={props.imgStyle} />
                    </ImageContainer>
                    {props.imageSecondary ? (
                        <ImageContainer style={{ position: 'relative', right: '20px', zIndex: 1 }}>
                            <img src={props.imageSecondary} height="50px" width="50px" />
                        </ImageContainer>
                    ) : (
                        <></>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            paddingLeft: '15px',
                            marginLeft: props.imageSecondary ? '-20px' : '0px',
                            marginTop: '7px',
                        }}
                    >
                        <h1>{props.name}</h1>
                        <p>{props.ticker}</p>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        paddingLeft: '15px',
                        marginTop: '7px',
                    }}
                >
                    <PrimaryHeader>{props.apy}</PrimaryHeader>
                    <p>APY</p>
                </div>
            </InternalCard>
        </Card>
    );
};

export default RewardCard;
