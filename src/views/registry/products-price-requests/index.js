import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Typography, message, Tabs, Button } from 'antd';
import { ListContainer, Card, TitleContainer } from './elements';
import NewPriceRequestModal from './components/new-price-request-modal';
import PriceRequestsList from './components/price-requests-list';
import { GET_PRICE_REQUESTS } from './graphql/queries';

const { Title } = Typography;
const { TabPane } = Tabs;

const ProductPriceRequests = ({ client }) => {
  const [isRequestModalOpen, toggleNewRequestModal] = useState(false);
  const [priceRequests, setPriceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rock: undefined,
    requester: undefined,
    reviewedBy: undefined,
    status: 'PENDING',
    creationStart: undefined,
    creationEnd: undefined,
    reviewedStart: undefined,
    reviewedEnd: undefined
  });

  useEffect(() => {
    const getPriceRequests = async () => {
      const { data, errors } = await client.query({
        query: GET_PRICE_REQUESTS,
        variables: { filters }
      });

      setLoading(false);

      if (errors) {
        message.error('Ocurrió un error obteniendo las solicitudes');
        return;
      }

      setPriceRequests(data.rockPriceRequests);
    };

    getPriceRequests();
  }, [client, filters, loading]);

  return (
    <>
      <ListContainer>
        <TitleContainer>
          <Title level={3}>Lista de solicitudes</Title>
          <Button onClick={() => toggleNewRequestModal(true)} type="primary" icon="form">
            Crear solicitud
          </Button>
        </TitleContainer>
        <Card>
          <Tabs
            animated={false}
            onChange={status => setFilters({ ...filters, status })}
            defaultActiveKey="PENDING"
          >
            <TabPane tab="Pending" key="PENDING" />
            <TabPane tab="Accepted" key="ACCEPTED" />
            <TabPane tab="Rejected" key="REJECTED" />
          </Tabs>
          <PriceRequestsList
            updateFather={() => setLoading(true)}
            loading={loading}
            priceRequests={priceRequests}
          />
        </Card>
      </ListContainer>
      {isRequestModalOpen && (
        <NewPriceRequestModal
          updateFather={() => setLoading(true)}
          visible={isRequestModalOpen}
          toggleNewRequestModal={toggleNewRequestModal}
        />
      )}
    </>
  );
};

ProductPriceRequests.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(ProductPriceRequests);
