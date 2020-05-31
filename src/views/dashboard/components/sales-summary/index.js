import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import moment from 'moment-timezone';
import { Card, Icon, message, Statistic, Typography } from 'antd';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'utils/functions';
import { GET_SUMMARY } from './graphql/queries';

const { Text } = Typography;

const SalesSummary = ({ client }) => {
  const [summary, setSummary] = useState({
    credit: 0,
    upfront: 0,
    total: 0,
    creditWeight: 0,
    upfrontWeight: 0
  });
  const filters = { start: moment().startOf('month'), end: moment().endOf('month') };

  useEffect(() => {
    const getSalesSummary = async () => {
      const {
        data: { ticketsSummary },
        errors
      } = await client.query({
        query: GET_SUMMARY,
        variables: { filters }
      });

      if (!errors) {
        setSummary(ticketsSummary);
      } else {
        message.error('Ha habido un error cargando el resumen de ventas!');
      }
    };

    getSalesSummary();
  });

  return (
    <>
      <Text disabled>{`De ${filters.start.format('ll')} a ${filters.end.format('ll')}`}</Text>
      <Card>
        <Statistic
          valueStyle={{ color: '#3f8600' }}
          title="Ventas"
          value={format.currency(summary?.total || 0)}
          suffix="MXN"
          prefix={<Icon type="rise" />}
        />
        <Statistic
          valueStyle={{ color: '#3f8600' }}
          title="Toneladas"
          value={format.number(summary?.upfrontWeight + summary?.creditWeight || 0)}
          suffix="tons"
          prefix={<Icon type="rise" />}
        />
        <ResponsiveContainer height={180}>
          <PieChart height={180}>
            <Pie
              dataKey="value"
              isAnimationActive={true}
              data={[
                {
                  name: 'credit',
                  value: Number(((summary.credit / summary.total) * 100).toFixed(2))
                },
                {
                  name: 'cash',
                  value: Number(((summary.upfront / summary.total) * 100).toFixed(2))
                }
              ]}
              outerRadius={50}
            >
              <Cell name="Crédito" key="credit" fill="#30CEE7" />
              <Cell name="Contado" key="cash" fill="#FFAB00" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
};

SalesSummary.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(SalesSummary);
