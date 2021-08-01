import { BigNumber } from '@ethersproject/bignumber';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { formatUnits, parseEther } from '@ethersproject/units';
import { InputNumber } from 'antd';
import React from 'react';
import styled from 'styled-components';
import useERC20Contract from '../../../../hooks/useERC20Contract';
import { Asset } from '../../../../lib/asset';
import { Fund } from '../../../../lib/fund';
import { parseBalance } from '../../../../util';
import Outline from '../../../Button/Outline';
import { Col, Row } from '../../../Layout';
import { approveMessage, errorMessage, txMessage } from '../../../Messages';

interface Props {
    asset: Asset;
    isMinting?: boolean;
    value: BigNumber;
    setValue: any;
    fund: Fund | undefined;
    approved?: boolean;
    disabled?: boolean;
    balance?: BigNumber | undefined;
}

const InputContainer = styled.div`
    position: relative;
    width: 100%;
    height: 50px;
    overflow: hidden;
    margin 10px 0px;
`;

const TextBold = styled.div`
    font-size: 16px;
    font-weight: bold;
    font-family: 'Visuelt';
    margin: 3px 10px 0px 10px;
`;

const Field = styled.span`
    color: ${(props) => props.theme.grey};
`;

const Underlying: React.FC<Props> = (props: Props): React.ReactElement => {
    const assetContract = useERC20Contract(props.asset.address, true);

    return (
        <Col span={24}>
            <Row>
                <Col span={24}>
                    <InputContainer>
                        <InputNumber
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '15px',
                                padding: '5px 0px 0px 5px',
                                overflow: 'hidden',
                                boxShadow: 'none',
                            }}
                            stringMode={true}
                            min={'0'}
                            value={formatUnits(props.value, 18)}
                            onChange={(value) => {
                                value = value ? value : '0';
                                props.setValue(parseEther(value));
                            }}
                            disabled={!props.isMinting || !props.approved || props.disabled}
                            size="large"
                        />
                        <TextBold style={{ position: 'absolute', bottom: '10px', right: '20px' }}>
                            {props.asset ? props.asset.symbol : '...'}
                        </TextBold>
                    </InputContainer>
                </Col>
                <Col span={12} style={{ alignItems: 'flex-start', justifyContent: 'flex-start', paddingLeft: '10px' }}>
                    <Field>
                        {`Balance: ${props.balance ? parseBalance(props.balance) : '0.00'} ${props.asset.symbol}`}
                    </Field>
                </Col>
                <Col span={12}>
                    <Outline
                        style={{
                            width: '100%',
                            display:
                                props.isMinting && props.approved != undefined && !props.approved ? 'flex' : 'none',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        disabled={!props.fund}
                        onClick={() => {
                            assetContract
                                ?.approve(
                                    props.fund?.address,
                                    BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
                                )
                                .then((tx: TransactionResponse) => {
                                    txMessage(tx);
                                    return tx.wait(1);
                                })
                                .then((tx: TransactionReceipt) => {
                                    approveMessage(tx);
                                })
                                .catch((e: any) => {
                                    errorMessage(e.message || e.data.message);
                                });
                        }}
                    >
                        Approve
                    </Outline>
                </Col>
            </Row>
        </Col>
    );
};

export default Underlying;
