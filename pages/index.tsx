import { Layout, Row, Col, Image } from 'antd';
import styled from 'styled-components';
import React from 'react';
import OutlinedButton from '../components/Button/Outline';
import RewardCard from '../components/RewardCard';

const RowContainer = styled.div`
    width: 100vw;
    background: ${(props) => props.theme.white + ' 0% 0% no-repeat padding-box'};

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px;

    p {
        margin-top: 10px;
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
`;

const Landing: React.FC = (): React.ReactElement => {
    return (
        <Layout.Content>
            <RowContainer>
                <LandingRow>
                    <LandingCol span={12}>
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
                    <LandingCol span={12}>
                        <Image height="100%" src="/assets/box_main.svg" preview={false} />
                    </LandingCol>
                </LandingRow>
            </RowContainer>
            <RowContainer>
                <LandingRow>
                    <LandingCol span={12}>
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
                    <LandingCol span={1} />
                    <LandingCol span={11}>
                        <RewardCard
                            image="/assets/logo.svg"
                            name="Bundle"
                            ticker="BDL-BNB"
                            apy="Pending"
                            imgStyle={{ marginTop: '3px', marginLeft: '2px' }}
                            cardStyle={{ maxWidth: '550px' }}
                        />
                    </LandingCol>
                </LandingRow>
            </RowContainer>
            <RowContainer>
                <LandingRow>
                    <LandingCol span={12}>
                        <Image
                            width="100%"
                            src="/assets/box_secondary.svg"
                            preview={false}
                            style={{ marginLeft: '-5%' }}
                        />
                    </LandingCol>
                    <LandingCol span={12}>
                        <div>
                            <div style={{ position: 'relative' }}>
                                <h1 style={{ position: 'relative' }}>
                                    A dao, <br />
                                    that comes in{' '}
                                    <span style={{ color: 'white', position: 'relative' }}>
                                        <img
                                            src="/assets/boxes.svg"
                                            width="125px"
                                            style={{ position: 'absolute', right: '3px', bottom: '5px' }}
                                        />
                                        <span style={{ position: 'relative' }}>boxes</span>
                                    </span>
                                </h1>
                            </div>
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
