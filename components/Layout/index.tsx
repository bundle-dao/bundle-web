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

export const Col = styled(ACol)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        padding-top: 50px;
    }
`;