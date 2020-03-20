import React, { useState, useEffect } from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Modal, Table, Tag } from 'antd';
import { GET_SPECIAL_PRICES } from './graphql/queries';

const UserPricesModal = ({ toggleUserPricesModal, userId, client: apollo, visible }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPrices([]);
      return;
    }

    const getUserPrices = async () => {
      const {
        data: { clientPricesByClient: pricesToSet }
      } = await apollo.query({
        query: GET_SPECIAL_PRICES,
        variables: { client: userId }
      });

      setLoading(false);
      setPrices(pricesToSet);
    };

    getUserPrices();
  }, [userId, apollo, visible]);

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'rock.name',
      key: 'rock.name'
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: price => <Tag color="blue">${price} MXN</Tag>
    }
  ];

  return (
    <Modal
      title="Precios especiales de este cliente"
      visible={visible}
      footer={null}
      loading={loading}
      onCancel={() => toggleUserPricesModal(false)}
    >
      <Table
        pagination={false}
        columns={columns}
        dataSource={prices?.map(price => ({ ...price, key: shortid.generate() }))}
      />
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
