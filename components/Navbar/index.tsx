import { Col, Image, Row, Menu, Layout } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import React from 'react';
import Account from '../Account';
import { useWeb3React } from '@web3-react/core';
import useEagerConnect from '../../hooks/useEagerConnect';
import usePersonalSign from '../../hooks/usePersonalSign';
import { useRouter } from 'next/router';

const Nav = styled(Layout.Header)`
    width: 100vw;
    height: 66px;
    background: #ffffff 0% 0% no-repeat padding-box;
    box-shadow: 0px 3px 29px #00000012;

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 10;
`;

const NavContainer = styled(Row)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
    height: 66px;
`;

const Logo = styled(Image)`
    margin-top: 10px;
    margin-left: 55px;
`;

const MenuCol = styled(Col)`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
`;

const NavMenu = styled(Menu)`
    display: flex;
    flex-direction: row;
`;

const NavMenuItem = styled(Menu.Item)`
    height: 100%;
    padding: 0px 0px 1px 0px !important;
    margin: 0px 35px 0px 35px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    color: ${(props) => props.theme.primary};
    border-color: ${(props) => props.theme.primary};
    font-size: 16px;
    flex-grow: 0;

    &:hover {
        color: ${(props) => props.theme.primary} !important;
        border-bottom: 2px solid ${(props) => props.theme.primary} !important;
    }

    a {
        color: ${(props) => props.theme.primary} !important;
    }
`;

const Navbar: React.FC = (): React.ReactElement => {
    const router = useRouter();

    const { account, library } = useWeb3React();

    const triedToEagerConnect = useEagerConnect();

    const sign = usePersonalSign();

    const isConnected = typeof account === 'string' && !!library;

    return (
        <Nav>
            <NavContainer justify="center" align="middle">
                <Col span={4} style={{ height: '100%' }}>
                    <Link href="/">
                        <a>
                            <Logo height="55px" width="55px" src="/assets/primary_logo_shadow.svg" preview={false} />
                        </a>
                    </Link>
                </Col>
                <MenuCol span={20} style={{ height: '100%' }}>
                    <NavMenu mode="horizontal" selectedKeys={[router.pathname]}>
                        <NavMenuItem key="whitepaper">
                            <a href="/assets/bundle_whitepaper.pdf">Whitepaper</a>
                        </NavMenuItem>
                        {/*<NavMenuItem key="/staking">
                            <Link href="/staking"><a>Staking</a></Link>
                        </NavMenuItem>*/}
                        <NavMenuItem key="wallet">
                            <Account triedToEagerConnect={triedToEagerConnect} />
                        </NavMenuItem>
                    </NavMenu>
                </MenuCol>
            </NavContainer>
        </Nav>
    );
};

export default Navbar;
