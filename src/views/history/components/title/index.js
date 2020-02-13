import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DatePicker, Typography, Input } from 'antd';
import TitleContainer from './elements';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, handleDateFilterChange }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de boletas
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar boletas"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <RangePicker
        style={{ margin: 5 }}
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
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  handleDateFilterChange: PropTypes.func.isRequired
};

export default TableTitle;
