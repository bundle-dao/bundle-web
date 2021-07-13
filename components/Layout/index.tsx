import { Row as ARow, Col as ACol } from 'antd';
import styled from 'styled-components';

export const RowContainer = styled.div`
    width: 100vw;

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

interface RowProps {
    hideOnMobile?: boolean;
}

export const Row = styled(ARow)<RowProps>`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
    @media (max-width: 768px) {
        display: ${(props) => (props.hideOnMobile ? 'none' : 'default')};
    }
`;

interface ColProps {
    mobilePadding?: string;
    justify?: string;
    align?: string;
    hideOnMobile?: boolean;
    padding?: string;
}

export const Col = styled(ACol)<ColProps>`
    display: flex;
    flex-direction: column;
    justify-content: ${(props) => (props.justify ? props.justify : 'center')};
    align-items: ${(props) => (props.align ? props.align : 'center')};
    padding: ${(props) => (props.padding ? props.padding : '0px')};

    @media (max-width: 768px) {
        padding: ${(props) => (props.mobilePadding ? props.mobilePadding : '0px')};
        justify-content: center;
        align-items: center;
        display: ${(props) => (props.hideOnMobile ? 'none' : 'default')};
    }
`;
