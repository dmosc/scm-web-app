import React from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { DatePicker, Input, Typography } from 'antd';
import { TitleContainer, InputContainer } from './elements';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const TableTitle = ({ handleFilterChange }) => {
  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    handleFilterChange('range', { start, end });
  };

  return (
    <TitleContainer>
      <Title style={{ marginRight: 'auto' }} level={3}>
        Listado de facturas
      </Title>
      <InputContainer>
        <Text type="secondary">Búsqueda</Text>
        <Search
          allowClear
          placeholder="Buscar por folio"
          onChange={({ target: { value } }) => handleFilterChange('search', value)}
        />
      </InputContainer>
      <InputContainer>
        <Text type="secondary">Rango de fechas</Text>
        <RangePicker
          style={{ marginRight: 0 }}
          ranges={{
            'De hoy': [
              moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .add(1, 'day')
            ],
            'De ayer': [
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .subtract(1, 'day'),
              moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            ],
            'De este mes': [
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                ?.startOf('month'),
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .endOf('month')
            ],
            'Del mes pasado': [
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                ?.startOf('month')
                .subtract(1, 'month'),
              moment()
                ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .endOf('month')
                .subtract(1, 'month')
            ]
          }}
          onChange={dates => handleDateFilterChange(dates)}
          defaultValue={[moment().subtract(1, 'month'), moment()]}
        />
      </InputContainer>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired
};

export default withApollo(TableTitle);
