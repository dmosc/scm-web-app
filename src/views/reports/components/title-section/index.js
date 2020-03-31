import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography, DatePicker } from 'antd';
import moment from 'moment';
import { FiltersContainer, InputContainer } from './elements';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const TitleSection = ({ globalFilters, setGlobalFilters }) => {
  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    // This is a special case when 'De hoy' filter is set
    // and, since start and end are equal, nothing is returned
    // because nothing is between to equal dates
    if (start && end && start.toString() === end.toString()) {
      setGlobalFilters({ ...globalFilters, start: null, end: null });
    } else {
      setGlobalFilters({ ...globalFilters, start, end });
    }
  };

  return (
    <>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Dashboard de reportes
      </Title>
      <Divider style={{ margin: '10px 0' }} />
      <FiltersContainer>
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
      <Divider style={{ margin: '10px 0' }} />
    </>
  );
};

TitleSection.propTypes = {
  globalFilters: PropTypes.object.isRequired,
  setGlobalFilters: PropTypes.func.isRequired
};

export default TitleSection;
