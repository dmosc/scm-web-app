import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Modal, Table, Tag } from 'antd';
import { GET_CLIENT } from './graphql/queries';

const UserPricesModal = ({ toggleUserPricesModal, userId, client: apollo, visible }) => {
  const [client, setClient] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setClient({});
      return;
    }

    const getUserPrices = async () => {
      const {
        data: { client: clientToSet }
      } = await apollo.query({
        query: GET_CLIENT,
        variables: { id: userId }
      });

      delete clientToSet.prices.__typename;
      setLoading(false);
      setClient(clientToSet);
    };

    getUserPrices();
  }, [userId, apollo, visible]);

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'rock',
      key: 'rock'
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'rpice',
      render: price => <Tag color="blue">${price} MXN</Tag>
    }
  ];

  const data = client.prices
    ? Object.keys(client.prices)
        .filter(rock => client.prices[rock])
        .map(rock => ({ rock, price: client.prices[rock], key: rock }))
    : [];

  return (
    <Modal
      title="Precios especiales de este cliente"
      visible={visible}
      footer={null}
      loading={loading}
      onCancel={() => toggleUserPricesModal(false)}
    >
      <Table pagination={false} columns={columns} dataSource={data} />
    </Modal>
  );
};

UserPricesModal.defaultProps = {
  userId: ''
};

UserPricesModal.propTypes = {
  userId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  client: PropTypes.object.isRequired,
  toggleUserPricesModal: PropTypes.func.isRequired
};

export default withApollo(UserPricesModal);
