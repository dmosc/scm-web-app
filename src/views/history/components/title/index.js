import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import { Button, DatePicker, Input, Select, Typography } from 'antd';
import { FiltersContainer, HeadContainer, InputContainer, TitleContainer } from './elements';
import { GET_PRODUCTS, GET_REPORT } from './graphql/queries';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const TableTitle = ({ client, handleFilterChange, handleDateFilterChange, filters }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const downloadReport = async () => {
    setLoading(true);
    const {
      data: { archivedTicketsXLS }
    } = await client.query({
      query: GET_REPORT,
      variables: { filters }
    });

    const link = document.createElement('a');
    link.href = encodeURI(archivedTicketsXLS);
    link.download = `Tickets-Report-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoading(false);
  };

  useEffect(() => {
    const getProducts = async () => {
      const {
        data: { rocks }
      } = await client.query({
        query: GET_PRODUCTS,
        variables: { filters: {} }
      });

      setProducts(rocks);
    };
    getProducts();
  }, [client]);

  return (
    <TitleContainer>
      <HeadContainer>
        <Title style={{ margin: 'auto 10px' }} level={3}>
          Listado de boletas
        </Title>
        <Search
          style={{ width: 250, margin: 'auto 10px auto auto' }}
          allowClear
          placeholder="Buscar boletas"
          onChange={({ target: { value } }) => handleFilterChange('search', value)}
        />
        <Button loading={loading} type="primary" icon="file-excel" onClick={downloadReport}>
          {(loading && 'Generando...') || 'Descargar boletas'}
        </Button>
      </HeadContainer>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Tipo</Text>
          <Select
            onChange={value => handleFilterChange('type', value)}
            style={{ width: 120 }}
            value={filters.type || ''}
          >
            <Option value="">Todos</Option>
            <Option value="BILL">Factura</Option>
            <Option value="REMISSION">Remisión</Option>
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Producto</Text>
          <Select
            onChange={value => handleFilterChange('product', value)}
            style={{ width: 120 }}
            value={filters.product}
          >
            <Option value="">Todos</Option>
            {products.map(({ name, id }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Rango de fechas</Text>
          <RangePicker
            style={{ marginRight: 0 }}
            ranges={{
              'De hoy': [moment(), moment()],
              'De este mes': [moment().startOf('month'), moment().endOf('month')],
              'Del mes pasado': [
                moment()
                  .startOf('month')
                  .subtract(1, 'month'),
                moment()
                  .endOf('month')
                  .subtract(1, 'month')
              ]
            }}
            onChange={dates => handleDateFilterChange(dates)}
          />
        </InputContainer>
      </FiltersContainer>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  client: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  handleDateFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired
};

export default withApollo(TableTitle);
