import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Drawer, Row, Col, Divider, Spin, Typography } from 'antd';
import { sizes } from 'theme';
import { GET_TICKET } from './graphql/queries';
import EventsTimeLine from './components/events-timeline';
import Finnancial from './components/finnancial';
import Client from './components/client';
import Truck from './components/truck';
import Turn from './components/turn';
import Product from './components/product';
import Promotion from './components/promotion';
import Store from './components/store';
import { SpinnerContainer } from './elements';

const { Title } = Typography;

const Audit = ({ client, onClose, visible, ticketAuditing }) => {
  const [isLg, toggleLg] = useState(window.innerWidth > sizes.lg);
  const [ticket, setTicket] = useState({});
  const [loading, setLoading] = useState(true);

  const updateWidth = () => {
    toggleLg(window.innerWidth > sizes.lg);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const getTicket = async () => {
      const { data } = await client.query({
        query: GET_TICKET,
        variables: {
          id: ticketAuditing
        }
      });

      setTicket(data.ticket);
      setLoading(false);
    };

    if (ticketAuditing) {
      setLoading(true);
      getTicket();
    }
  }, [client, ticketAuditing]);

  return (
    <Drawer
      width={isLg ? '80%' : '100%'}
      placement="right"
      closable={false}
      onClose={onClose}
      visible={visible}
    >
      {loading ? (
        <SpinnerContainer>
          <Spin tip="loading" />
        </SpinnerContainer>
      ) : (
        <Row>
          <Title style={{ marginBottom: 30 }} level={3}>
            Boleta #{ticket.folio}
          </Title>
          <Col span={16}>
            <Client client={ticket.client} />
            <Divider />
            <Turn turn={ticket.turn} />
            <Divider />
            <Truck
              inTruckImage={ticket.inTruckImage}
              inTruckImageLeft={ticket.inTruckImageLeft}
              inTruckImageRight={ticket.inTruckImageRight}
              outTruckImage={ticket.outTruckImage}
              outTruckImageBack={ticket.outTruckImageBack}
              truck={ticket.truck}
              driver={ticket.driver}
            />
            <Divider />
            <Product
              product={ticket.product}
              pricePerTon={(ticket.totalPrice - ticket.tax) / ticket.totalWeight}
            />
            {ticket.store && (
              <>
                <Divider />
                <Store store={ticket.store} />
              </>
            )}
            {ticket.promotion && (
              <>
                <Divider />
                <Promotion promotion={ticket.promotion} />
              </>
            )}
            <Divider />
          </Col>
          <Col span={8}>
            <EventsTimeLine
              in={ticket.in}
              load={ticket.load}
              out={ticket.out}
              usersInvolved={ticket.usersInvolved}
            />
            <Divider />
            <Finnancial
              subtotal={ticket.totalPrice - ticket.tax}
              tax={ticket.tax}
              total={ticket.totalPrice}
              weight={ticket.weight}
              totalWeight={ticket.totalWeight}
              bill={ticket.bill}
              isBilled={ticket.isBilled}
              credit={ticket.credit}
              withScale={ticket.withScale}
            />
          </Col>
        </Row>
      )}
    </Drawer>
  );
};

Audit.defaultProps = {
  ticketAuditing: ''
};

Audit.propTypes = {
  client: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  ticketAuditing: PropTypes.string
};

export default withApollo(Audit);
