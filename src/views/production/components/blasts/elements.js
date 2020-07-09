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

  .ant-card-body,
  .ant-card {
    height: 100% !important;
  }

  .ant-pagination {
    margin-right: 10px !important;
  }
`;

export { TableContainer, Card };