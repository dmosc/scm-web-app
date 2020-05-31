import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, Empty, message, Typography } from 'antd';
import { GET_ROCK_SALES } from './graphql/queries';

const { Text } = Typography;

const ProductsSummary = ({ client }) => {
  const [loading, setLoading] = useState(false);
  const [productSalesReport, setProductSalesReport] = useState([]);
  const [filters] = useState({
    range: { start: moment().startOf('month'), end: moment().endOf('month') }
  });

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const {
          data: { rockSalesReportInRange }
        } = await client.query({
          query: GET_ROCK_SALES,
          variables: { filters }
        });

        setProductSalesReport(rockSalesReportInRange);
      } catch (e) {
        message.error('¡No se han podido cargar las ventas por producto!');
      }

      setLoading(false);
    };

    getData();
  }, [client, filters]);

  return (
    <>
      <Text disabled>{`De ${filters.range.start.format('ll')} a ${filters.range.end.format(
        'll'
      )}`}</Text>
      <Card loading={loading}>
        {productSalesReport?.rocks?.length > 0 && (
          <ResponsiveContainer height={180}>
            <PieChart width={180} height={180}>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={productSalesReport?.rocks?.map(
                  ({ rock: { name, color }, totalWeight: value }) => ({
                    name,
                    color,
                    value
                  })
                )}
                outerRadius={50}
                fill="#8884d8"
              >
                {productSalesReport?.rocks?.map(({ rock: { name, color } }) => (
                  <Cell key={name} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        {productSalesReport?.rocks?.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </Card>
    </>
  );
};

ProductsSummary.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(ProductsSummary);
