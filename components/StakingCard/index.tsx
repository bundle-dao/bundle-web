import { useWeb3React } from '@web3-react/core';
import Divider from 'antd/lib/divider';
import React, {useState} from 'react';
import styled from 'styled-components';
import useContract from '../../hooks/useContract';
import { getNamedAddress } from '../../util';
import BundleTokenABI from '../../contracts/BundleToken.json';
import MinterABI from '../../contracts/Minter.json';
import useStakedBalance from '../../hooks/useStakedBalance';
import usePendingRewards from '../../hooks/usePendingRewards';
import { Contract } from '@ethersproject/contracts';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Col, Row, InputNumber } from 'antd';
import useUnstakedBalance from '../../hooks/useUnstakedBalance';
import useERC20Contract from '../../hooks/useERC20Contract';
import OutlinedButton from '../Button/Outline';
import useApproved from '../../hooks/useApproved';
import { BigNumber } from '@ethersproject/bignumber';

interface Props {
    image: string;
    name: string;
    imageStyle: React.CSSProperties;
    pid: string;
    stakeToken: string;
    account: string | undefined;
};

interface BlockProps {
    width: string;
    minWidth?: string;
}

interface StakingDisplayProps {
    expanded: boolean;
}

const StakingCardContainer = styled.div`
    width: 100%;
    height: auto;
    border-radius: 3px;
    background-color: ${props => props.theme.white};
    box-shadow: 0px 2px 4px #0000004D;
    margin: 15px 0px;

    &:hover {
        box-shadow: 0px 3px 6px #0000004D;
    }
`;

const StakingInfoRow = styled(Row)`
    width: 100%;
    padding: 10px 20px;
    min-height: 75px;
    cursor: pointer;
`;

const InfoBlock = styled(Col)<BlockProps>`
    height: 100%;
    display: flex;
    width: ${props => props.width};
    min-width: ${props => props.minWidth ? props.minWidth : 'default'};
    align-items: center;
`;

const TextBold = styled.div`
    font-size: 18px;
    font-weight: bold;
    font-family: 'Visuelt';
    margin: 0px 10px 0px 10px;
`;

const Text = styled.div`
    font-size: 18px;
    font-family: 'Visuelt';
    margin: 0px 10px 0px 10px;
`;

const ImageContainer = styled.div`
    width: 60px;
    height: 55px;
    border-radius: 50%;
    box-shadow: 2px 2px 5px #00000012;
    margin-right: 10px;
`;

const StakingDisplay = styled.div<StakingDisplayProps>`
    height: ${props => props.expanded ? 'auto': '0px'};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PercentageContainer = styled.div`
    display: flex;
    flex-direction: row;
    border: ${props => `1px solid ${props.theme.grey}`};
    border-radius: 6px;
    height: 26px;
    width: 80%;
    min-width: 222px;
    overflow: hidden;
    margin: 0px auto;
`;

const Percentage = styled.div`
    cursor: pointer;
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: ${props => props.theme.spaceGrey};
    }

    transition: background-color 100ms linear;
`;

const PercentageDivider = styled.div`
    width: 1px;
    height: 100%;
    background-color: ${props => props.theme.grey};
`;

const getApyApr = async (pid: string, setApy: React.Dispatch<React.SetStateAction<string>>, setApr: React.Dispatch<React.SetStateAction<string>>, minter: Contract | undefined, bundleToken: Contract | undefined) => {
    if (!!minter && !!bundleToken) {
        const pInfo = await minter.poolInfo(pid);
        const totalAllocPoint = await minter.totalAllocPoint();
        const staked = await bundleToken.balanceOf(pInfo.stakeToken);
        const rewardsPerDay = await minter.blockRewards() * 28800;
        const dpr = rewardsPerDay / staked * pInfo.allocPoint / totalAllocPoint + 1;
        const apy = dpr ** 365;
        const apr = dpr * 365;
        
        setApy(`${(apy * 100).toPrecision(2)}%`);
        setApr(`${(apr * 100).toPrecision(2)}%`);
    }
}

const StakingCard: React.FC<Props> = (props: Props): React.ReactElement => {
    const [expanded, setExpanded] = useState(false);
    const [apy, setApy] = useState('...');
    const [apr, setApr] = useState('...');
    const [toStake, setToStake] = useState(0);
    const [toUnstake, setToUnstake] = useState(0);

    const { chainId } = useWeb3React();
    const minterAddress = getNamedAddress(chainId, "Minter");
    const bundleTokenAddress = getNamedAddress(chainId, "BundleToken");
    const minter = useContract(minterAddress!, MinterABI, true);
    const bundleToken = useContract(bundleTokenAddress, BundleTokenABI, true);
    const stakeToken = useERC20Contract(props.stakeToken, true);

    getApyApr(props.pid, setApy, setApr, minter, bundleToken);

    const stakedBalance = useStakedBalance(minter, props.pid).data;
    const pendingRewards = usePendingRewards(minter, props.pid).data;
    const unstakedBalance = useUnstakedBalance(stakeToken).data;
    const approved = useApproved(stakeToken, minterAddress).data;

    return (
        <StakingCardContainer>
            <StakingInfoRow onClick={() => setExpanded(!expanded)} align="middle">
                <InfoBlock width="auto" style={{flexGrow: 1}}>
                    <ImageContainer>
                        <img src={props.image} width="100%" height="100%" style={props.imageStyle} />
                    </ImageContainer>
                    <TextBold>{props.name}</TextBold>
                </InfoBlock>
                <Divider type="vertical" style={{height: "100%"}} />
                <InfoBlock width="auto" style={{justifyContent: "center", flexGrow: 1}}>
                    <TextBold>{`APY: ${apy}`}</TextBold>
                    <TextBold>{`APR: ${apr}`}</TextBold>
                </InfoBlock>
                <Divider type="vertical" style={{height: "100%"}} />
                <InfoBlock width="auto" style={{justifyContent: "center", flexGrow: 2}}>
                    <Text>{`Staked: ${stakedBalance ? stakedBalance : '0.00'} ${props.name}`}</Text>
                    <Text>{`Rewards: ${pendingRewards ? pendingRewards : '0.00'} BDL`}</Text>
                </InfoBlock>
                <InfoBlock width="auto">
                    { expanded ? <CaretUpOutlined style={{marginBottom: '3px'}}/> : <CaretDownOutlined style={{marginBottom: '3px'}}/> }
                </InfoBlock>
            </StakingInfoRow>
            <StakingDisplay expanded={expanded}>
                <Divider style={{margin: '5px 0px'}} />
                <Row justify="center" style={{padding: "10px 20px"}}>
                    <Col sm={24} md={6} flex="">
                        <Text style={{margin: "0px"}}>Available: {`${unstakedBalance} ${props.name}`}</Text>
                        <InputNumber 
                            min={0} 
                            style={{width: "100%", margin: "10px 0px 10px 0px"}}
                            value={toStake}
                            onChange={setToStake}
                            disabled={unstakedBalance <= 0 && typeof props.account === 'string'}
                            size="large"
                        />
                    </Col>
                    <Col sm={24} md={6}>
                        <PercentageContainer>
                            <Percentage onClick={() => setToStake(unstakedBalance * 0.25)}>
                                <div>25%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance * 0.50)}>
                                <div>50%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance * 0.75)}>
                                <div>75%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToStake(unstakedBalance)}>
                                <div>100%</div>
                            </Percentage>
                        </PercentageContainer>
                        <OutlinedButton 
                            style={{height: "38px", margin: "12px auto", width: "80%", padding: "0px", minWidth: "222px", display: "block"}} 
                            disabled={stakedBalance <= 0 && typeof props.account === 'string'}
                            onClick={
                                () => {
                                    if (approved) {
                                        minter?.deposit(props.account, props.pid, BigNumber.from("1000000000000000000").mul(toStake));
                                    } else {
                                        stakeToken?.approve(minterAddress, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
                                    }
                                }
                            }
                        >
                            {approved ? 'Deposit' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                    <Col sm={24} md={6}>
                        <Text style={{margin: "0px"}}>Available: {`${stakedBalance} ${props.name}`}</Text>
                        <InputNumber 
                            min={0} 
                            style={{width: "100%", margin: "10px 0px 10px 0px"}}
                            value={toUnstake}
                            onChange={setToUnstake}
                            disabled={stakedBalance <= 0 && typeof props.account === 'string'}
                            size="large"
                        />
                    </Col>
                    <Col sm={24} md={6}>
                        <PercentageContainer>
                            <Percentage onClick={() => setToUnstake(stakedBalance * 0.25)}>
                                <div>25%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance * 0.50)}>
                                <div>50%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance * 0.75)}>
                                <div>75%</div>
                            </Percentage>
                            <PercentageDivider />
                            <Percentage onClick={() => setToUnstake(stakedBalance)}>
                                <div>100%</div>
                            </Percentage>
                        </PercentageContainer>
                        <OutlinedButton 
                            style={{height: "38px", margin: "12px auto", width: "80%", padding: "0px", minWidth: "222px", display: "block"}} 
                            disabled={stakedBalance <= 0 && typeof props.account === 'string'}
                            onClick={
                                () => {
                                    if (approved) {
                                        minter?.withdraw(props.account, props.pid, BigNumber.from("1000000000000000000").mul(toUnstake));
                                    } else {
                                        stakeToken?.approve(minterAddress, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
                                    }
                                }
                            }
                        >
                            {approved ? 'Withdraw' : 'Approve'}
                        </OutlinedButton>
                    </Col>
                </Row>
            </StakingDisplay>
        </StakingCardContainer>
    );
}

export default StakingCard;
