import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const HistoryContainer = styled.div`
  display: flex;
  width: 100%;
  font-size: 8px;
  /* 64 for header and 79 for footer */
  min-height: calc(105vh - 64px - 79px);
`;

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

  overflow: scroll;

  .ant-pagination {
    margin-right: 10px !important;
  }
`;

export { HistoryContainer, TableContainer, Card };
