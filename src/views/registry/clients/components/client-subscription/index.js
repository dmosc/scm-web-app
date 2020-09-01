import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal } from 'antd';
import ClientSubscriptionForm from './components/client-subscription-form';

const ClientSubscription = ({ currentClient, close }) => {
  const NewClientSubscriptionForm = Form.create({ name: 'store' })(ClientSubscriptionForm);

  return (
    <Modal
      title={`Iniciar seguimiento de cliente ${currentClient.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={650}
      footer={null}
    >
      <NewClientSubscriptionForm currentClient={currentClient} close={close} />
    </Modal>
  );
};

ClientSubscription.propTypes = {
  currentClient: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default ClientSubscription;
