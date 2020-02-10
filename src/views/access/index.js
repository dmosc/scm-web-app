import React from 'react';
import { withApollo } from 'react-apollo';
import { useAuth } from 'components/providers/withAuth';
import { Form } from 'antd';
import Container from 'components/common/container';
import TicketInit from './components/ticket-init-form';
import TrucksList from './components/trucks-list';

const Access = () => {
  const TicketInitForm = Form.create({ name: 'truck' })(TicketInit);
  const { user } = useAuth();

  return (
    <>
      <Container title="Ingreso de camión" width="60%">
        <TicketInitForm user={user} />
      </Container>
      <Container title="Camiones activos" width="40%">
        <TrucksList />
      </Container>
    </>
  );
};

export default withApollo(Access);
