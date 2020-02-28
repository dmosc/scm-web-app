import React from 'react';
import { withApollo } from 'react-apollo';
import { useAuth } from 'components/providers/withAuth';
import { Form } from 'antd';
import Container from 'components/common/container';
import TicketInit from './components/ticket-init-form';
import TrucksList from './components/trucks-list';
import AccessContainer from './elements';

const Access = () => {
  const TicketInitForm = Form.create({ name: 'truck' })(TicketInit);
  const { user } = useAuth();

  return (
    <AccessContainer>
      <Container title="Ingreso de camión" margin="20px" width="60%">
        <TicketInitForm user={user} />
      </Container>
      <Container title="Camiones activos" margin="20px" width="40%">
        <TrucksList />
      </Container>
    </AccessContainer>
  );
};

export default withApollo(Access);
