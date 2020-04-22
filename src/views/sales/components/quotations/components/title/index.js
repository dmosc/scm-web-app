import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Typography, Input, Button, DatePicker } from 'antd';
import { TitleContainer, InputContainer, InputRow } from './elements';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const TableTitle = ({ handleFilterChange, toggleNewQuotation }) => {
  const handleDateFilterChange = (key, [start, end]) => {
    // This is a special case when 'De hoy' filter is set
    // and, since start and end are equal, nothing is returned
    // because nothing is between to equal dates
    if (start && end && start.toString() === end.toString()) {
      handleFilterChange(key, { start: null, end: null });
    } else {
      handleFilterChange(key, { start, end });
    }
  };

  return (
    <TitleContainer>
      <InputRow>
        <Title style={{ margin: 'auto 10px' }} level={3}>
          Listado de cotizaciones
        </Title>
        <Search
          style={{ width: 250, margin: 'auto 10px auto auto' }}
          allowClear
          placeholder="Cliente"
          onChange={({ target: { value } }) => handleFilterChange('client', value)}
        />
        <Button type="primary" icon="file-add" onClick={() => toggleNewQuotation(true)}>
          Crear
        </Button>
      </InputRow>
      <InputRow style={{ marginTop: 10, justifyContent: 'flex-end' }}>
        <InputContainer>
          <Text type="secondary">Fecha de vencimiento</Text>
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
            onChange={dates => handleDateFilterChange('validRange', dates)}
          />
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Fecha de creación</Text>
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
            onChange={dates => handleDateFilterChange('createdRange', dates)}
          />
        </InputContainer>
      </InputRow>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewQuotation: PropTypes.func.isRequired
};

export default TableTitle;
