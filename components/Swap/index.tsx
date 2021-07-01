import React from "react";
import styled from "styled-components";
import Outline from "../Button/Outline";
import Card from "../Card";
import { Col, Row } from "../Layout";

interface SelectorProps {
    selected?: boolean;
}

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
        color: ${props => props.theme.primary};
    }

    transition: color 100ms linear, border 100ms linear;
`;

const Swap: React.FC = (): React.ReactElement => {
    return (
        <Col span={24} style={{width: '100%', flexGrow: 1}}>
            <Card style={{minHeight: '475px', height: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-start', padding: '20px 30px'}}>
                <Col span={24}>
                    <Row style={{display: 'flex', justifyContent: 'center'}}>
                        <Selector>Buy</Selector>
                        <Selector>Sell</Selector>
                    </Row>
                    <Row style={{paddingTop: '15px', display: 'flex', justifyContent: 'center'}}>
                        <Outline style={{width: '100%'}}>Approve</Outline>
                    </Row>
                </Col>
            </Card>
        </Col>
    );
}

export default Swap;