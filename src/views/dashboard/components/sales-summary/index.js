import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Card, Empty, Icon, message, Statistic, Typography } from 'antd';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'utils/functions';
import { GET_SUMMARY } from './graphql/queries';

const { Text } = Typography;

const SalesSummary = ({ client, range }) => {
  const [summary, setSummary] = useState({
    clean: {
      total: 0,
      totalWeight: 0
    },
    dirty: {
      total: 0,
      totalWeight: 0
    }
  });
  const [dirty] = useState([
    '5e22071b1c9d440000de6933',
    '5e742b26cf78df7ac5da4129',
    '5e0042963bf0ef408d2b330c'
  ]);

  useEffect(() => {
    const getSalesSummary = async () => {
      const {
        data: { rockSalesReportCleanAndDirty },
        errors
      } = await client.query({
        query: GET_SUMMARY,
        variables: { filters: { range }, dirty }
      });

      if (!errors) {
        setSummary(rockSalesReportCleanAndDirty);
      } else {
        message.error('Ha habido un error cargando el resumen de ventas!');
      }
    };

    getSalesSummary();
  }, [client, range, dirty]);

  return (
    <>
      <Text disabled>{`De ${range.start.format('ll')} a ${range.end.format('ll')}`}</Text>
      <Card>
        {(summary.clean.total > 0 || summary.dirty.total > 0) && (
          <>
            <Statistic
              valueStyle={{ color: '#3f8600' }}
              title="Ventas"
              value={format.currency(summary?.clean.total + summary?.dirty.total || 0)}
              suffix="MXN"
              prefix={<Icon type="rise" />}
            />
            <Statistic
              valueStyle={{ color: '#3f8600' }}
              title="Toneladas"
              value={format.number(summary?.clean.totalWeight + summary?.dirty.totalWeight || 0)}
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
                      name: 'clean',
                      value: Number(summary.clean.totalWeight.toFixed(2))
                    },
                    {
                      name: 'dirty',
                      value: Number(summary.dirty.totalWeight.toFixed(2))
                    }
                  ]}
                  outerRadius={50}
                >
                  <Cell name="Limpias" key="clean" fill="#30CEE7" />
                  <Cell name="Sucias" key="dirty" fill="#FFAB00" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
        {summary.clean.total === 0 && summary.dirty.total === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </>
  );
};

SalesSummary.propTypes = {
  client: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired
};

export default withApollo(SalesSummary);
