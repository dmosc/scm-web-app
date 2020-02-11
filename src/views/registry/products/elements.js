import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const TableContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 30px;
`;

const Card = styled(CommonCard)`
  width: 100%;
`;

export { TableContainer, Card };
