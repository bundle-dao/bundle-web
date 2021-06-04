import { Layout } from 'antd';
import React from 'react';
import { RowContainer, Row, Col } from '../../components/Layout';

const Landing: React.FC = (): React.ReactElement => {
    return (
        <Layout.Content>
            <RowContainer>
                <Row>
                    <Col></Col>
                </Row>
            </RowContainer>
        </Layout.Content>
    );
};

export default Landing;
