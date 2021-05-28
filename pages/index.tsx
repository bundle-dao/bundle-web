import { Layout, Row, Col, Image } from 'antd';
import styled from 'styled-components';
import React, { useState } from 'react';
import OutlinedButton from '../components/Button/Outline';
import RewardCard from '../components/RewardCard';
import { getNamedAddress } from '../util';
import useContract from '../hooks/useContract';
import MinterABI from '../contracts/Minter.json';
import BundleTokenABI from '../contracts/BundleToken.json';
import { Contract } from '@ethersproject/contracts';
import Link from 'next/link';

const CHAINID = 97;

interface RowContainerProps {
    dark?: boolean;
}

const RowContainer = styled.div<RowContainerProps>`
    width: 100vw;
    background: ${(props) => props.theme.white + ' 0% 0% no-repeat padding-box'};

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px;

    p {
        margin-top: 10px;
    }

    @media (max-width: 768px) {
        padding: 30px;
    }
`;

const LandingRow = styled(Row)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
`;

const LandingCol = styled(Col)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        padding-top: 50px;
    }
`;

const SecondaryBox = styled(Image)`
    @media (max-width: 768px) {
        width: 120% !important;
        margin-left: -10% !important;
    }
`;

const Box = styled.img`
    @media (max-width: 768px) {
        display: none;
    }
`;

const BoxHeader = styled.div`
    @media (max-width: 768px) {
        span {
            color: rgba(0, 0, 0, 0.85) !important;
        }
    }
`;

const BoxMain = styled.img`
    @media (max-width: 768px) {
        margin-right: -20% !important;
    }
`;

const getApy = async (
    pid: string,
    setState: React.Dispatch<React.SetStateAction<string>>,
    minter: Contract,
    bundleToken: Contract
) => {
    const pInfo = await minter.poolInfo(pid);
    const totalAllocPoint = await minter.totalAllocPoint();
    const tokenAddress = pInfo.stakeToken;
    const allocPoints = pInfo.allocPoint;
    const staked = await bundleToken.balanceOf(tokenAddress);
    const rewardsPerDay = (await minter.blockRewards()) * 28800;
    const dpr = ((rewardsPerDay / staked) * allocPoints) / totalAllocPoint + 1;
    let apy = dpr ** 365;

    setState('' + (apy * 100).toPrecision(2) + '%');
};

const Landing: React.FC = (): React.ReactElement => {
    const minterAddress = getNamedAddress(CHAINID, 'Minter');
    const bundleTokenAddress = getNamedAddress(CHAINID, 'BundleToken');
    const minter = useContract(minterAddress!, MinterABI);
    const bundleToken = useContract(bundleTokenAddress!, BundleTokenABI);
    const [bdlApy, setBdlApy] = useState('...');

    if (minter != undefined && bundleToken != undefined) {
        getApy('1', setBdlApy, minter, bundleToken);
    }

    return (
        <Layout.Content>
            <RowContainer dark={true}>
                <LandingRow>
                    <LandingCol xs={24} sm={24} md={12}>
                        <div>
                            <h1 style={{ position: 'relative' }}>
                                <img
                                    src="/assets/bundle.svg"
                                    width="275px"
                                    style={{ position: 'absolute', bottom: '0px', left: '50px' }}
                                />
                                We are a dao.
                            </h1>
                            <p style={{ maxWidth: '600px' }}>
                                Bundle is redefining passive asset management within the space. We're a
                                community-governed project offering full exposure to crypto risk-management and the DeFi
                                ecosystem through passively managed, non-custodial funds and indices.
                            </p>
                            <div style={{ margin: '30px 0px' }}>
                                <a href="/assets/bundle_whitepaper.pdf">
                                    <OutlinedButton>Discover</OutlinedButton>
                                </a>
                            </div>
                        </div>
                    </LandingCol>
                    <LandingCol xs={24} sm={24} md={12}>
                        <BoxMain height="100%" width="100%" src="/assets/box_main.svg" />
                    </LandingCol>
                </LandingRow>
            </RowContainer>
            <RowContainer>
                <LandingRow>
                    <LandingCol xs={24} sm={24} md={12}>
                        <div>
                            <h1 style={{ position: 'relative', maxWidth: '600px' }}>
                                Earn rewards for active participation
                            </h1>
                            <p style={{ maxWidth: '600px' }}>
                                At Bundle, we decided to distribute governance tokens in return for active community
                                participation. With no private investment, presale or ICO, all tokens are being
                                distributed fairly and deterministically to individuals actively supporting our mission.
                            </p>
                        </div>
                    </LandingCol>
                    <LandingCol xs={0} sm={0} md={1} />
                    <LandingCol xs={24} sm={24} md={11}>
                        <Link href="/staking">
                            <a style={{ width: '85%' }}>
                                <RewardCard
                                    image="/assets/logo.svg"
                                    name="Bundle"
                                    ticker="BDL-BNB"
                                    apy={bdlApy}
                                    width="100%"
                                    imgStyle={{ marginTop: '3px', marginLeft: '2px' }}
                                    cardStyle={{ maxWidth: '550px' }}
                                />
                            </a>
                        </Link>
                    </LandingCol>
                </LandingRow>
            </RowContainer>
            <RowContainer>
                <LandingRow>
                    <LandingCol xs={24} sm={24} md={12}>
                        <SecondaryBox
                            width="100%"
                            src="/assets/box_secondary.svg"
                            preview={false}
                            style={{ marginLeft: '-5%' }}
                        />
                    </LandingCol>
                    <LandingCol xs={24} sm={24} md={12}>
                        <div>
                            <BoxHeader style={{ position: 'relative' }}>
                                <h1 style={{ position: 'relative' }}>
                                    A dao, <br />
                                    that comes in{' '}
                                    <span style={{ color: 'white', position: 'relative' }}>
                                        <Box
                                            src="/assets/boxes.svg"
                                            width="125px"
                                            style={{ position: 'absolute', right: '3px', bottom: '5px' }}
                                        />
                                        <span style={{ position: 'relative' }}>boxes</span>
                                    </span>
                                </h1>
                            </BoxHeader>
                            <p style={{ maxWidth: '600px' }}>
                                Bundle is tearing down traditional financial definitions surrounding funds and indices
                                through our innovative Bundles. We're building a protocol that enables users to
                                passively maintain risk-optimal portfolios while still gaining the benefits and returns
                                of active DeFi protocol participation.
                            </p>
                        </div>
                    </LandingCol>
                </LandingRow>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
