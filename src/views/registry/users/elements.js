import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const TableContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 30px;
`;

const Card = styled(CommonCard)`
  width: 100%;

  .ant-card-body,
  .ant-card {
    padding: 0;
    height: 100% !important;
  }

  .ant-pagination {
    margin-right: 10px !important;
  }
`;

export { TableContainer, Card };
