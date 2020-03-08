import React, { useState } from 'react';
import { withAuth } from 'components/providers/withAuth';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment';
import { Select, Typography, DatePicker } from 'antd';
import Container from 'components/common/container';
import { ReportsContainer, FiltersContainer, InputContainer } from './elements';
import ProductSales from './components/products';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const reports = {
  global: () => (
    <>
      <Container display="flex">
        <Title>Sección en construcción...</Title>
        <img src="static/images/section_under_construction.png" alt="Sección en construcción" />
      </Container>
    </>
  ),
  products: filters => (
    <>
      <ProductSales filters={filters} />
    </>
  ),
  tickets: () => (
    <>
      <Container display="flex">
        <Title>Sección en construcción...</Title>
        <img src="static/images/section_under_construction.png" alt="Sección en construcción" />
      </Container>
    </>
  ),
  clients: () => (
    <>
      <Container display="flex">
        <Title>Sección en construcción...</Title>
        <img src="static/images/section_under_construction.png" alt="Sección en construcción" />
      </Container>
    </>
  ),
  trucks: () => (
    <>
      <Container display="flex">
        <Title>Sección en construcción...</Title>
        <img src="static/images/section_under_construction.png" alt="Sección en construcción" />
      </Container>
    </>
  ),
  turns: () => (
    <>
      <Container display="flex">
        <Title>Sección en construcción...</Title>
        <img src="static/images/section_under_construction.png" alt="Sección en construcción" />
      </Container>
    </>
  )
};

const Reports = () => {
  const [report, setReport] = useState('global');
  const [filters, setFilters] = useState({
    start: null,
    end: null,
    type: null
  });
  const debouncedFilters = useDebounce(filters, 1000);

  const handleFilterChange = (key, value) => {
    // eslint-disable-next-line no-param-reassign
    if ((key === 'type' || key === 'turn') && value === '') value = null;
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    // This is a special case when 'De hoy' filter is set
    // and, since start and end are equal, nothing is returned
    // because nothing is between to equal dates
    if (start && end && start.toString() === end.toString()) {
      setFilters({ ...filters, start: null, end: null });
    } else {
      setFilters({ ...filters, start, end });
    }
  };

  return (
    <ReportsContainer>
      <FiltersContainer>
        <Container justifycontent="center" alignitems="center" width="100%">
          <FiltersContainer>
            <InputContainer>
              <Text type="secondary">Tipo de reporte</Text>
              <Select
                onChange={value => setReport(value)}
                style={{ width: 240 }}
                value={report || 'global'}
              >
                <Option value="global">Global</Option>
                <Option value="products">Productos</Option>
                <Option value="tickets">Boletas</Option>
                <Option value="clients">Clientes</Option>
                <Option value="trucks">Camiones</Option>
                <Option value="turns">Turnos</Option>
              </Select>
            </InputContainer>
            <InputContainer>
              <Text type="secondary">Tipo de boletas</Text>
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
              <Text type="secondary">Rango de fechas</Text>
              <RangePicker
                style={{ marginRight: 0 }}
                ranges={{
                  'De hoy': [moment().subtract(1, 'day'), moment()],
                  'De ayer': [moment().subtract(2, 'day'), moment().subtract(1, 'day')],
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
        </Container>
      </FiltersContainer>
      {reports[report](debouncedFilters)}
    </ReportsContainer>
  );
};

export default withAuth(Reports);
