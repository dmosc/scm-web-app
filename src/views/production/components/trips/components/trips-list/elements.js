import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

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

const TripsListContainer = styled.div`
  display: grid;
  grid-template-rows: ${props => props.currentLap ? '1.5fr 2.5fr' : '4fr'};
  grid-gap: 30px;
  padding: 0 20px;
  width: 100%;
  /* 64 for header and 79 for footer */
  min-height: calc(100vh - 64px - 79px);
  height: calc(100vh - 64px - 79px);
  overflow-x: scroll;
`;

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const LineContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

export { Card, TripsListContainer, TitleContainer, LineContainer };