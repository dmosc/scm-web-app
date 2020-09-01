import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const Card = styled(CommonCard)`
  width: 100%;
  border-radius: 5px;
`;

const ObservationsHistoryContainer = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  grid-gap: 30px;
  padding: 0 20px;
  width: 100%;
`;

export { Card, ObservationsHistoryContainer };
