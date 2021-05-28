import { Col, Image, Row, Menu, Layout } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import React from 'react';
import Account from '../Account';
import useEagerConnect from '../../hooks/useEagerConnect';
import { useRouter } from 'next/router';
import SubMenu from 'antd/lib/menu/SubMenu';
import { MenuOutlined } from '@ant-design/icons';
import OutlineButton from '../Button/Outline';

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
    padding-bottom: 3px;

    @media (max-width: 768px) {
        visibility: hidden;
        width: 0px;
    }

    @media (min-width: 768px) {
        visibility: visible;
        width: auto;
    }
`;

const NavMenu = styled(Menu)`
    display: flex;
    flex-direction: row;

    @media (max-width: 768px) {
        visibility: hidden;
    }
`;

const NavMenuItem = styled(Menu.Item)`
    height: 100%;
    padding: 3px 0px 1px 0px !important;
    margin: 0px 20px 0px 20px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    color: ${(props) => props.theme.primary};
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

const NavMenuCol = styled(Col)`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 100%;

    @media (max-width: 768px) {
        visibility: visible;
        width: auto;
    }

    @media (min-width: 768px) {
        visibility: hidden;
        width: 0px;
    }
`;

const Navbar: React.FC = (): React.ReactElement => {
    const router = useRouter();

    const triedToEagerConnect = useEagerConnect();

    const activeStyle = {
        borderColor: '#E7694C'
    }

    return (
        <Nav>
            <NavContainer justify="center" align="middle">
                <Col xs={10} sm={10} md={4} style={{ height: '100%' }}>
                    <Link href="/">
                        <a>
                            <Logo height="55px" width="55px" src="/assets/primary_logo_shadow.svg" preview={false} />
                        </a>
                    </Link>
                </Col>
                <MenuCol xs={0} sm={0} md={20} style={{ height: '100%' }}>
                    <NavMenu mode="horizontal" selectedKeys={[router.pathname]}>
                        <NavMenuItem key="whitepaper">
                            <a href="/assets/bundle_whitepaper.pdf">Whitepaper</a>
                        </NavMenuItem>
                        <NavMenuItem key="/staking" style={"/staking" == router.pathname ? activeStyle : {}}>
                            <Link href="/staking"><a>Staking</a></Link>
                        </NavMenuItem>
                        <NavMenuItem key="wallet">
                            <Account triedToEagerConnect={triedToEagerConnect} />
                        </NavMenuItem>
                    </NavMenu>
                    <a href="" target="_blank" rel="noopener noreferrer">
                        <OutlineButton style={{marginLeft: "20px"}}>
                            Buy BDL
                        </OutlineButton>
                    </a>
                </MenuCol>
                <NavMenuCol xs={14} sm={14} md={0} style={{ height: '100%' }}>
                    <Menu mode="horizontal">
                        <SubMenu key="SubMenu" icon={<MenuOutlined />} title="Menu">
                            <Menu.ItemGroup title="Bundle">
                                <Menu.Item key="bdl">
                                    <Link href="/staking"><a>Buy BDL</a></Link>
                                </Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="Navigation">
                                <Menu.Item key="whitepaper">
                                    <a href="/assets/bundle_whitepaper.pdf">Whitepaper</a>
                                </Menu.Item>
                                <Menu.Item key="/staking" style={"/staking" == router.pathname ? activeStyle : {}}>
                                    <Link href="/staking"><a>Staking</a></Link>
                                </Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="Wallet">
                                <Menu.Item key="wallet">
                                    <Account triedToEagerConnect={triedToEagerConnect} />
                                </Menu.Item>
                            </Menu.ItemGroup>
                        </SubMenu>
                    </Menu>
                </NavMenuCol>
            </NavContainer>
        </Nav>
    );
};

export default Navbar;
