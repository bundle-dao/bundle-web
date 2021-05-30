import { Col, Image, Row, Layout } from 'antd';
import styled from 'styled-components';
import React from 'react';

const Foot = styled(Layout.Footer)`
    width: 100vw;
    height: 60px;
    background: ${(props) => props.theme.darkGrey + ' 0% 0% no-repeat padding-box'};

    display: flex;
    justify-content: center;
    align-items: center;

    a {
        color: ${(props) => props.theme.white};

        &:hover {
            color: ${(props) => props.theme.grey};
        }
    }
`;

const FootContainer = styled(Row)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
    height: 60px;
    overflow: hidden;
`;

const Logo = styled(Image)`
    opacity: 0.3;
    margin-top: -3px;
`;

const FlexCol = styled<any>(Col)`
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: ${(props) => props.align};
    justify-content: center;
`;

const Dots = styled(Image)`
    transform: matrix(0.84, -0.54, 0.54, 0.84, 0, 0);
    opacity: 0.3;
    margin-right: 55px;
`;

const FooterLink = styled.a`
    margin: 0px 20px;
    font-size: 16px;
`;

const Footer: React.FC = (): React.ReactElement => {
    return (
        <Foot>
            <FootContainer align="middle">
                <FlexCol xs={24} sm={24} md={10} align="flex-start">
                    <Row>
                        <FooterLink href="https://discord.gg/QAenj3DHyc">Discord</FooterLink>
                        <FooterLink href="https://twitter.com/bundledao">Twitter</FooterLink>
                        <FooterLink href="https://bundledao.medium.com/">Medium</FooterLink>
                        <FooterLink href="https://github.com/bundle-dao">Github</FooterLink>
                    </Row>
                </FlexCol>
                <FlexCol sm={0} md={4} align="center">
                    <Logo height="46px" width="55px" src="/assets/dark_logo.svg" preview={false} />
                </FlexCol>
                <FlexCol sm={0} md={10} align="flex-end" style={{ height: '69px' }}>
                    <Dots height="172px" width="162px" src="/assets/footer_dots.svg" preview={false} />
                </FlexCol>
            </FootContainer>
        </Foot>
    );
};

export default Footer;
