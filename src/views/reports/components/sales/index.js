import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { withApollo } from 'react-apollo';
import { DatePicker, Typography, InputNumber, Button } from 'antd';
import { FiltersContainer, InputContainer } from './elements';
import { GET_SALES_AUXILIARY } from './graphql/queries';

const { Text } = Typography;
const { MonthPicker } = DatePicker;

const SalesReport = ({ client }) => {
  const [loadingSalesAuxiliary, setLoadingSalesAuxiliary] = useState(false);
  const [month, setMonth] = useState(moment()?.startOf('month'));
  const [workingDays, setWorkingDays] = useState({
    total: moment().daysInMonth(),
    passed: 1
  });

  const downloadSalesAuxiliary = async () => {
    setLoadingSalesAuxiliary(true);

    const {
      data: { ticketsAuxiliarySalesXLS }
    } = await client.query({
      query: GET_SALES_AUXILIARY,
      variables: {
        month,
        workingDays: workingDays.total,
        workingDaysPassed: workingDays.passed
      }
    });

    const link = document.createElement('a');
    link.href = encodeURI(ticketsAuxiliarySalesXLS);
    link.download = `AUXILIAR-VENTAS-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingSalesAuxiliary(false);
  };

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Mes seleccionado</Text>
          <MonthPicker
            value={month}
            onChange={date => setMonth(date?.startOf('month'))}
            placeholder="Select month"
          />
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Días hábiles del mes</Text>
          <InputNumber
            value={workingDays.total}
            onChange={total => setWorkingDays({ ...workingDays, total })}
            min={1}
          />
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Días hábiles transcurridos</Text>
          <InputNumber
            value={workingDays.passed}
            onChange={passed => setWorkingDays({ ...workingDays, passed })}
            min={1}
          />
        </InputContainer>
        <Button
          style={{ marginLeft: 'auto', marginTop: 20 }}
          loading={loadingSalesAuxiliary}
          type="primary"
          icon="file-excel"
          onClick={downloadSalesAuxiliary}
        >
          {(loadingSalesAuxiliary && 'Generando...') || 'Auxiliar de ventas'}
        </Button>
      </FiltersContainer>
    </>
  );
};

SalesReport.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(SalesReport);
