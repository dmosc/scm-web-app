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

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const LineContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0px;
  padding: 0px;
  
  > * {
    margin-right: 5px;
  }
`;

export { Card, TitleContainer, LineContainer, ButtonContainer };