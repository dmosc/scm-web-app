import styled from 'styled-components';
import {Col, Collapse, Tag} from "antd";

const Column = styled(Col)`
    display: flex; 
    flex-direction: column;
    justify-content: center; 
    align-items: center;
`;

const ColumnTitle = styled(Tag)`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-weight: 600;
`;

const CollapseContainer = styled(Collapse)`
    min-height: 65vh;
    max-height: 65vh;
    margin: 10px;
    padding: 30px;
    box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15);
    overflow-y: scroll;
    
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    :hover {
        box-shadow: 0 0 3rem 0 rgba(136, 152, 170, 0.2);
    }
    
    ::-webkit-scrollbar {
        display: none;
    }
`;

export {Column, ColumnTitle , CollapseContainer};