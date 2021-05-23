import { Layout, Row, Col, Image } from 'antd';
import styled from 'styled-components';
import React from 'react';

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

    @media (max-width: 768px) {
        padding: 30px;
    }
`;

const StakingRow = styled(Row)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
`;

const StakingCol = styled(Col)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        padding-top: 50px;
    }
`;

const Landing: React.FC = (): React.ReactElement => {
    return (
        <Layout.Content>
            <RowContainer>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
