import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import 'antd/dist/antd.css';

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
    return new Web3Provider(provider);
}

const theme = {
    maxWidth: '1500px',
    primary: '#E7694C',
    darkGrey: '#292929',
    grey: '#AAAAAA',
    spaceGrey: '#EFEFEF',
    white: '#FFFFFF',
    primaryDark: '#d15e43',
};

export default function NextWeb3App({ Component, pageProps }: AppProps) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <style jsx global>{`
                @font-face {
                    font-family: 'Optima';
                    font-style: normal;
                    font-weight: normal;
                    src: url('/fonts/OPTIMA.woff') format('woff');
                }

                @font-face {
                    font-family: 'Optima';
                    font-style: normal;
                    font-weight: bold;
                    src: url('/fonts/OPTIMA_B.woff') format('woff');
                }

                @font-face {
                    font-family: 'Visuelt';
                    font-style: normal;
                    font-weight: bold;
                    src: url('/fonts/VisueltPro-Bold.ttf') format('truetype');
                }

                @font-face {
                    font-family: 'Visuelt';
                    font-style: normal;
                    font-weight: light;
                    src: url('/fonts/VisueltPro-Light.ttf') format('truetype');
                }

                @font-face {
                    font-family: 'Visuelt';
                    font-style: normal;
                    font-weight: normal;
                    src: url('/fonts/VisueltPro-Regular.ttf') format('truetype');
                }

                body {
                    margin: 0;
                }

                p {
                    font-family: 'Optima';
                }

                h1,
                h2 {
                    font-family: 'Visuelt';
                    font-weight: bold;
                    line-height: 1;
                }

                h1 {
                    font-size: 45px;
                    margin-bottom: 0px;
                }

                h3,
                h4,
                h5,
                h6,
                a {
                    font-family: 'Visuelt';
                }

                img {
                    -webkit-user-drag: none;
                    -khtml-user-drag: none;
                    -moz-user-drag: none;
                    -o-user-drag: none;
                    user-drag: none;
                }
            `}</style>
            <ThemeProvider theme={theme}>
                <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
                    <head>
                        <title>Bundle</title>
                        <link rel="icon" href="/favicon.ico" />
                    </head>

                    <Navbar />
                    <Component {...pageProps} />
                    <Footer />
                </Layout>
            </ThemeProvider>
        </Web3ReactProvider>
    );
}
