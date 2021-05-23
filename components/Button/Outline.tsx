import { Button } from 'antd';
import styled from 'styled-components';

export default styled(Button)`
    background: ${(props) => props.theme.white + ' 0% 0% no-repeat padding-box'};
    border: ${(props) => '2px solid ' + props.theme.primary} !important;
    border-radius: 6px;
    color: ${(props) => props.theme.darkGrey};
    padding: 10px 35px;
    text-align: center;
    height: 45px;
    font-weight: bold;

    &:hover {
        background: ${(props) => props.theme.primary + ' 0% 0% no-repeat padding-box'};
        color: ${(props) => props.theme.white};
    }
`;
