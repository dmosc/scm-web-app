import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const TableContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 30px;
  border: none;
`;

const Card = styled(CommonCard)`
  width: 100%;
  border-radius: 5px;
`;

export { TableContainer, Card };
