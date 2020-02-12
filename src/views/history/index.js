import React from 'react';
import Container from 'components/common/container';
import TicketsList from './components/tickets-list';
import HistoryContainer from './elements';

const History = () => (
  <HistoryContainer>
    <Container display="flex" justifycontent="center" alignitems="center">
      <TicketsList />
    </Container>
  </HistoryContainer>
);

export default History;
