import { Col, Image, Row, Menu, Layout } from "antd";
import Link from "next/link";
import styled from "styled-components";
import React from 'react';
import Account from '../Account';
import { verifyMessage } from "@ethersproject/wallet";
import { useWeb3React } from "@web3-react/core";
import useEagerConnect from "../../hooks/useEagerConnect";
import usePersonalSign from "../../hooks/usePersonalSign";

const Nav = styled(Layout.Header)`
    width: 100vw;
    height: 66px;
    background: #FFFFFF 0% 0% no-repeat padding-box;
    box-shadow: 0px 3px 29px #00000012;

    display: flex;
    justify-content: center;
    align-items: center;
`;

const NavContainer = styled(Row)`
    max-width: ${props => props.theme.maxWidth};
    width: 100%;
    height: 66px;
`;

const Logo = styled(Image)`
    margin-top: 3px;
    margin-left: 55px;
`;

const MenuCol = styled(Col)`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
`;

const NavMenuItem = styled(Menu.Item)`
    height: 100%;
    padding: 0px 0px 1px 0px !important;
    margin: 0px 35px 0px 35px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    color: ${props => props.theme.primary};
    border-color: ${props => props.theme.primary};
    font-size: 16px;
    flex-grow: 0;

    &:hover {
        color: ${props => props.theme.primary} !important;
        border-bottom: 2px solid ${props => props.theme.primary} !important;
    }

    a {
        color: ${props => props.theme.primary} !important;
    }
`;

const Navbar: React.FC = (): React.ReactElement => {
    const { account, library } = useWeb3React();

    const triedToEagerConnect = useEagerConnect();
  
    const sign = usePersonalSign();
  
    const handleSign = async () => {
      const msg = "Next Web3 Boilerplate Rules";
      const sig = await sign(msg);
      console.log(sig);
      console.log("isValid", verifyMessage(msg, sig) === account);
    };
  
    const isConnected = typeof account === "string" && !!library;

    return (
        <Nav>
            <NavContainer justify="center" align="middle">
                <Col span={4} style={{height: '100%'}}>
                    <Link href="/">
                        <a><Logo height="55px" width="55px" src="/assets/primary_logo.svg" preview={false} /></a>
                    </Link>
                </Col>
                <MenuCol span={20} style={{height: '100%'}}>
                    <Menu mode="horizontal">
                        <NavMenuItem>
                            <a href="/assets/bundle_whitepaper.pdf">Whitepaper</a>
                        </NavMenuItem>
                    </Menu>
                    <Menu mode="horizontal">
                        <NavMenuItem>
                            <Link href="/staking"><a>Staking</a></Link>
                        </NavMenuItem>
                    </Menu>
                    <Menu mode="horizontal">
                        <NavMenuItem>
                            <Account triedToEagerConnect={triedToEagerConnect}/>
                        </NavMenuItem>
                    </Menu>
                </MenuCol>
            </NavContainer>
        </Nav>
    );
};

export default Navbar;