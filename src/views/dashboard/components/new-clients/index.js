import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { List, message, Typography } from 'antd';
import moment from 'moment-timezone';
import { GET_CLIENTS } from './graphql/queries';

const { Text } = Typography;

const NewClients = ({ client, range }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const getClients = async () => {
      const { data, errors } = await client.query({
        query: GET_CLIENTS,
        variables: { filters: { range } }
      });

      if (!errors) {
        setClients(data.clientsCreatedIn);
      } else {
        message.error('Ha habido un error cargando los nuevos clientes!');
      }
    };

    getClients();
  }, [client, range]);

  return (
    <>
      <Text disabled>{`De ${range.start.format('ll')} a ${range.end.format('ll')}`}</Text>
      <List
        style={{ height: '30vh', overflow: 'scroll' }}
        dataSource={clients}
        bordered
        renderItem={newClient => (
          <List.Item key={newClient.id}>
            <List.Item.Meta
              title={`[${newClient.uniqueId}] ${newClient.businessName}`}
              description={`Desde ${moment(newClient.createdAt).format('ll')}`}
            />
          </List.Item>
        )}
      />
    </>
  );
};

NewClients.propTypes = {
  client: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired
};

export default withApollo(NewClients);
