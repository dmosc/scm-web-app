import React from 'react';
import Container from 'components/common/container';
import TicketsList from './components/tickets-list';

const History = () => (
  <>
    <Container display="flex" justifycontent="center" alignitems="center">
      <TicketsList />
    </Container>
  </>
);

export default History;
