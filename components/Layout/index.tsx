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

export const Row = styled(ARow)`
    max-width: ${(props) => props.theme.maxWidth};
    width: 100%;
`;

interface ColProps {
    mobilePadding?: string;
    justify?: string;
}

export const Col = styled(ACol)<ColProps>`
    display: flex;
    flex-direction: column;
    justify-content: ${ props => props.justify ? props.justify : 'center'};
    align-items: center;

    @media (max-width: 768px) {
        padding: ${ props => props.mobilePadding ? props.mobilePadding : '50px 0px 0px 0px'};
        justify-content: center;
    }
`;