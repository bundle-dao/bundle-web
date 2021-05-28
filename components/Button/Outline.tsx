import { Button } from 'antd';
import styled from 'styled-components';

interface Props {
    disabled?: boolean;
}

export default styled(Button)<Props>`
    background: ${(props) =>
        props.disabled ? props.theme.spaceGrey : props.theme.white + ' 0% 0% no-repeat padding-box'};
    border: ${(props) => '2px solid ' + (props.disabled ? props.theme.grey : props.theme.primary)} !important;
    border-radius: 6px;
    color: ${(props) => props.theme.darkGrey};
    padding: 10px 35px;
    text-align: center;
    height: 45px;
    font-weight: bold;

    &:hover {
        background: ${(props) => (props.disabled ? 'default' : props.theme.primary + ' 0% 0% no-repeat padding-box')};
        color: ${(props) => (props.disabled ? 'default' : props.theme.white)} !important;
    }
`;
