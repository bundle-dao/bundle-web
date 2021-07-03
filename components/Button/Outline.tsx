import { Button } from 'antd';
import styled from 'styled-components';

interface Props {
    disabled?: boolean;
    selected?: boolean;
}

export default styled(Button)<Props>`
    background: ${(props) =>
        props.disabled
            ? props.theme.spaceGrey
            : props.selected
            ? props.theme.primary + ' 0% 0% no-repeat padding-box'
            : props.theme.white + ' 0% 0% no-repeat padding-box'};
    border: ${(props) => '2px solid ' + (props.disabled ? props.theme.grey : props.theme.primary)} !important;
    border-radius: 10px;
    color: ${(props) =>
        props.selected ? props.theme.white : props.disabled ? props.theme.grey : props.theme.primary} !important;
    padding: 10px 35px 10px 35px;
    text-align: center;
    height: 45px;
    font-weight: normal;

    &:hover {
        background: ${(props) => (props.disabled ? 'default' : props.theme.primary + ' 0% 0% no-repeat padding-box')};
        color: ${(props) => (props.disabled ? 'default' : props.theme.white)} !important;
    }
`;
