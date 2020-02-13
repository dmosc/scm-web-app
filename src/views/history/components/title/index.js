import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import { DatePicker, Typography, Input, Button } from 'antd';
import TitleContainer from './elements';
import { GET_REPORT } from './graphql/queries';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ client, handleFilterChange, handleDateFilterChange, filters }) => {
  const [loading, setLoading] = useState(false);
  const downloadReport = async () => {
    setLoading(true);
    const {
      data: { archivedTicketsReport }
    } = await client.query({
      query: GET_REPORT,
      variables: { filters }
    });

    const link = document.createElement('a');
    link.href = encodeURI(archivedTicketsReport);
    link.download = `Tickets-Report-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoading(false);
  };

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
      <Button loading={loading} type="primary" icon="file-excel" onClick={downloadReport}>
        {(loading && 'Generando...') || 'Descargar .xls'}
      </Button>
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
