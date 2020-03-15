import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 30px;
  padding-top: 10px;
  border: none;
`;

const Card = styled(CommonCard)`
  width: 100%;
  border-radius: 5px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export { ListContainer, Card, TitleContainer };
