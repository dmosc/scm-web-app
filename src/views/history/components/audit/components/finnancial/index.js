import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { Statistic, Divider, Typography, Tag } from 'antd';
import { Container, Indicator } from './elements';

const { Text, Title } = Typography;

const Finnancial = ({
  total,
  subtotal,
  tax,
  weight,
  totalWeight,
  bill,
  credit,
  withScale,
  isBilled
}) => {
  return (
    <Container>
      <Title style={{ marginBottom: 20 }} level={4}>
        Pago
      </Title>
      <Statistic title="Subtotal" suffix="MXN" value={format.currency(subtotal)} />
      <Statistic title="Impuesto" suffix="MXN" value={format.currency(tax)} />
      <Statistic title="Total" suffix="MXN" value={format.currency(total)} />
      <Divider />
      <Title style={{ marginBottom: 20 }} level={4}>
        Peso
      </Title>
      <Statistic title="Peso total" suffix="tons" value={format.number(weight)} />
      <Statistic title="Peso de producto" suffix="tons" value={format.number(totalWeight)} />
      <Divider />
      <Title style={{ marginBottom: 20 }} level={4}>
        Indicadores
      </Title>
      <Indicator>
        <Text strong>Tipo</Text>
        <Tag size="small" color={bill ? 'purple' : 'green'}>
          {bill ? 'Factura' : 'Remision'}
        </Tag>
      </Indicator>
      <Indicator>
        <Text strong>Pago</Text>
        <Tag size="small" color={credit ? 'purple' : 'green'}>
          {credit ? 'Crédito' : 'Contado'}
        </Tag>
      </Indicator>
      <Indicator>
        <Text strong>¿Usó pesa?</Text>
        <Tag size="small" color={withScale ? 'green' : 'purple'}>
          {withScale ? 'Sí' : 'No'}
        </Tag>
      </Indicator>
      <Indicator>
        <Text strong>Facturado</Text>
        <Tag size="small" color={isBilled ? 'green' : 'purple'}>
          {isBilled ? 'Sí' : 'No'}
        </Tag>
      </Indicator>
    </Container>
  );
};

Finnancial.propTypes = {
  subtotal: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  tax: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired,
  totalWeight: PropTypes.number.isRequired,
  bill: PropTypes.bool.isRequired,
  credit: PropTypes.bool.isRequired,
  withScale: PropTypes.bool.isRequired,
  isBilled: PropTypes.bool.isRequired
};

export default Finnancial;
