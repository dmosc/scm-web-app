import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { List, Typography } from 'antd';
import ListContainer from 'components/common/list';
import { GET_BILL_SUMMARY } from './graphql/queries';

const { Title } = Typography;

const BillSubmit = ({ client, currentClient, targetTickets: tickets }) => {
  const [billSummary, setBillSummary] = useState({
    products: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    if (tickets.length > 0 && currentClient) {
      const getData = async () => {
        const {
          data: { ticketsToBillSummary }
        } = await client.query({
          query: GET_BILL_SUMMARY,
          variables: { tickets }
        });

        setBillSummary(ticketsToBillSummary);
      };

      getData();
    } else {
      setBillSummary({ products: [], subtotal: 0, tax: 0, total: 0 });
    }
  }, [client, currentClient, tickets, setBillSummary]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 20px' }}>
      <div>
        <Title level={4}>{`Subtotal - $${billSummary.subtotal}`}</Title>
        <Title level={4}>{`Impuestos - $${billSummary.tax}`}</Title>
        <Title level={3}>{`Total - $${billSummary.total}`}</Title>
      </div>
      <ListContainer title={`Lista de productos (${billSummary.products.length})`} height="20vh">
        <List
          loading={false}
          bordered
          dataSource={billSummary.products}
          size="small"
          renderItem={({ product, total }) => (
            <>
              <List.Item>
                <List.Item.Meta title={`${product.name} - ${total}`} />
              </List.Item>
            </>
          )}
        />
      </ListContainer>
    </div>
  );
};

BillSubmit.defaultProps = {
  currentClient: null
};

BillSubmit.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.string,
  targetTickets: PropTypes.array.isRequired
};

export default withApollo(BillSubmit);
