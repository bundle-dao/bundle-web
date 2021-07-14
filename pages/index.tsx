import { Layout, Row, Col, Image } from 'antd';
import styled from 'styled-components';
import React, { useState } from 'react';
import OutlinedButton from '../components/Button/Outline';
import RewardCard from '../components/RewardCard';
import { formatNumber, getNamedAddress } from '../util';
import useContract from '../hooks/useContract';
import MinterABI from '../contracts/Minter.json';
import BundleTokenABI from '../contracts/BundleToken.json';
import { Contract } from '@ethersproject/contracts';
import Link from 'next/link';
import PairABI from '../contracts/Pair.json';
import { formatUnits, parseEther } from '@ethersproject/units';
import { getAsset } from '../lib/asset';

const CHAINID = 56;

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
    setApy: React.Dispatch<React.SetStateAction<string>>,
    minter: Contract | undefined,
    bundleToken: Contract | undefined,
    stakeToken: Contract | undefined,
    token0: string | undefined,
    token1: string | undefined
) => {
    try {
        if (!!minter && !!bundleToken && !!stakeToken) {
            const minterAddress = getNamedAddress(CHAINID, 'Minter');

            const batch = [];
            batch.push(minter.poolInfo(pid));
            batch.push(minter.totalAllocPoint());
            batch.push(getAsset(bundleToken.address, bundleToken.provider));
            batch.push(getAsset(token0, bundleToken.provider));
            batch.push(getAsset(token1, bundleToken.provider));
            batch.push(stakeToken.totalSupply());
            batch.push(stakeToken.getReserves());

            const batchResult = await Promise.all(batch).then((values) => values);

            const pInfo = batchResult[0];
            const totalAllocPoint = batchResult[1];
            const bundleAsset = batchResult[2];
            const token0Asset = batchResult[3];
            const token1Asset = batchResult[4];
            const stakeTokenSupply = batchResult[5];
            const token0Supply = batchResult[6][0];
            const token1Supply = batchResult[6][1];

            const stakeTokenPrice = token0Supply
                .mul(token0Asset.price)
                .add(token1Supply.mul(token1Asset.price))
                .mul(parseEther('1'))
                .div(stakeTokenSupply);

            const staked = (await stakeToken.balanceOf(minterAddress)).mul(stakeTokenPrice).div(parseEther('1'));
            const rewardsPerDay = (await minter.blockRewards()).mul(bundleAsset.price).mul(28800);

            const stakedFormatted = parseFloat(formatUnits(staked));
            const rewardsFormatted = parseFloat(formatUnits(rewardsPerDay));

            const dpr = ((rewardsFormatted / stakedFormatted) * pInfo.allocPoint) / totalAllocPoint;
            const apy = (1 + dpr) ** 365 - 1;

            setApy(`${formatNumber(apy * 100)}%`);
        }
    } catch (e) {}
};

const Landing: React.FC = (): React.ReactElement => {
    const minterAddress = getNamedAddress(CHAINID, 'Minter');
    const bundleTokenAddress = getNamedAddress(CHAINID, 'BundleToken');
    const minter = useContract(minterAddress!, MinterABI);
    const bundleToken = useContract(bundleTokenAddress!, BundleTokenABI);

    const stakeToken = useContract('0x693e745700D278Bf7e180D3fD94FA1A740807926', PairABI, false);
    const bDEFIStakeToken = useContract('0x107a78f4e90141bb4aacdb6b4c903f27baf43e58', PairABI, false);
    const bCHAINStakeToken = useContract('0x3666d1eE816852A6BD08196243567D3945058E40', PairABI, false);
    const bSTBLStakeToken = useContract('0xaF748cE79E2c966a660A34c803e63A3e6553E670', PairABI, false);

    const [bdlApy, setBdlApy] = useState('...');
    const [bDEFIApy, setbDEFIApy] = useState('...');
    const [bCHAINApy, setbChainApy] = useState('...');
    const [bSTBLApy, setbSTBLApy] = useState('...');

    if (minter != undefined && bundleToken != undefined) {
        getApy(
            '0',
            setBdlApy,
            minter,
            bundleToken,
            stakeToken,
            '0x7ff78e1cab9a2710eb6486ecbf3d94d125039364',
            '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        );
        getApy(
            '1',
            setbDEFIApy,
            minter,
            bundleToken,
            bDEFIStakeToken,
            '0x9eeA2a500455cb08BfdF20D1000a0B5CFF63A495',
            '0xe9e7cea3dedca5984780bafc599bd69add087d56'
        );
        getApy(
            '2',
            setbChainApy,
            minter,
            bundleToken,
            bCHAINStakeToken,
            '0x3E96F79a607d0d2199976c292f9CDF73991A3439',
            '0xe9e7cea3dedca5984780bafc599bd69add087d56'
        );
        getApy(
            '3',
            setbSTBLApy,
            minter,
            bundleToken,
            bSTBLStakeToken,
            '0x934C7F600d6eE2fb60CdFf61d1b9fC82C6b8C011',
            '0xe9e7cea3dedca5984780bafc599bd69add087d56'
        );
    }

    return (
        <Layout.Content>
            <RowContainer dark={true}>
                <LandingRow>
                    <LandingCol xs={24} sm={24} md={12}>
                        <div>
                            <h1 style={{ position: 'relative' }}>
                                <img
                                    src="/assets/bundle.png"
                                    width="275px"
                                    style={{
                                        position: 'absolute',
                                        bottom: '-15px',
                                        left: '50px',
                                        zIndex: 0,
                                        opacity: '0.25',
                                    }}
                                />
                                <span style={{ zIndex: 2 }}>We are a dao.</span>
                            </h1>
                            <p style={{ maxWidth: '600px' }}>
                                Bundle is redefining passive asset management. We're a community-governed project
                                offering full exposure to crypto risk-management and the DeFi ecosystem through
                                passively managed, non-custodial funds and indices.
                            </p>
                            <div style={{ margin: '30px 0px' }}>
                                <a href="https://docs.bundledao.org">
                                    <OutlinedButton>Discover</OutlinedButton>
                                </a>
                            </div>
                        </div>
                    </LandingCol>
                    <LandingCol xs={24} sm={24} md={12}>
                        <BoxMain height="100%" width="100%" src="/assets/box_main.png" />
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
                                    imageSecondary="/assets/BNB.png"
                                    name="Bundle"
                                    ticker="BDL-BNB"
                                    apy={bdlApy}
                                    width="100%"
                                    imgStyle={{ marginTop: '2px', marginLeft: '2px' }}
                                    cardStyle={{ maxWidth: '550px' }}
                                />
                            </a>
                        </Link>
                        <Link href="/staking">
                            <a style={{ width: '85%' }}>
                                <RewardCard
                                    image="/assets/primary_logo_token.svg"
                                    imageSecondary="/assets/BUSD.png"
                                    name="bDefi Index"
                                    ticker="bDEFI-BNB"
                                    apy={bDEFIApy}
                                    width="100%"
                                    imgStyle={{ marginTop: '2px', marginLeft: '2px' }}
                                    cardStyle={{ maxWidth: '550px' }}
                                />
                            </a>
                        </Link>
                        <Link href="/staking">
                            <a style={{ width: '85%' }}>
                                <RewardCard
                                    image="/assets/primary_logo_token.svg"
                                    imageSecondary="/assets/BUSD.png"
                                    name="bChain Index"
                                    ticker="bCHAIN-BNB"
                                    apy={bCHAINApy}
                                    width="100%"
                                    imgStyle={{ marginTop: '2px', marginLeft: '2px' }}
                                    cardStyle={{ maxWidth: '550px' }}
                                />
                            </a>
                        </Link>
                        <Link href="/staking">
                            <a style={{ width: '85%' }}>
                                <RewardCard
                                    image="/assets/primary_logo_token.svg"
                                    imageSecondary="/assets/BUSD.png"
                                    name="bStable"
                                    ticker="bSTBL-BNB"
                                    apy={bSTBLApy}
                                    width="100%"
                                    imgStyle={{ marginTop: '2px', marginLeft: '2px' }}
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
