import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const Client = ({ client }) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Cliente
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Nombre del negocio">{client.businessName}</Descriptions.Item>
        <Descriptions.Item label="Cliente">
          {client.firstName} {client.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="RFC">{client.rfc}</Descriptions.Item>
        <Descriptions.Item label="Teléfonos">{client.cellphone.toString()}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

Client.propTypes = {
  client: PropTypes.shape({
    businessName: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    rfc: PropTypes.string,
    cellphone: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default Client;
