import React, { useState } from 'react';
import { DatePicker, Typography, Card, Button } from 'antd';
import moment from 'moment-timezone';
import { useAuth } from 'components/providers/withAuth';
import PostsList from './components/posts-list';
import SalesSummary from './components/sales-summary';
import NewClients from './components/new-clients';
import ProductsSummary from './components/products-summary';
import Goals from './components/goals';
import { InputContainer, GeneralContainer, GraphsContainer } from './elements';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Dashboard = () => {
  const [isAddPostModalOpen, toggleAddPostModal] = useState(false);
  const [range, setRange] = useState({
    start: moment().startOf('month'),
    end: moment().endOf('month')
  });

  const { isAdmin, isManager } = useAuth();

  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    // This is a special case when 'De hoy' filter is set
    // and, since start and end are equal, nothing is returned
    // because nothing is between to equal dates
    if (dates.length === 0) {
      setRange({ start: moment().startOf('month'), end: moment().endOf('month') });
    } else if (start && end && start.toString() === end.toString()) {
      setRange({ start: null, end: null });
    } else {
      setRange({
        start: start?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        end: end?.set({ hour: 23, minute: 59, second: 59, millisecond: 59 })
      });
    }
  };

  return (
    <GeneralContainer>
      <Card
        title="Posts recientes"
        extra={
          (isAdmin || isManager) && (
            <Button onClick={() => toggleAddPostModal(true)} type="primary" icon="plus">
              Añadir
            </Button>
          )
        }
      >
        <PostsList
          toggleAddPostModal={toggleAddPostModal}
          isAddPostModalOpen={isAddPostModalOpen}
        />
      </Card>
      {(isAdmin || isManager) && (
        <div>
          <InputContainer>
            <Text type="secondary">Rango de fechas</Text>
            <RangePicker
              style={{ width: '50%' }}
              defaultValue={[range.start, range.end]}
              ranges={{
                'De hoy': [
                  moment()
                    .startOf('day')
                    .subtract(1, 'day'),
                  moment().endOf('day')
                ],
                'De esta semana': [moment().startOf('week'), moment().endOf('week')],
                'De la semana pasada': [
                  moment()
                    .startOf('week')
                    .subtract(1, 'week'),
                  moment()
                    .endOf('week')
                    .subtract(1, 'week')
                ],
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
          <GraphsContainer>
            <Card title="Resumen de ventas">
              <SalesSummary range={range} />
            </Card>
            <Card title="Metas">
              <Goals />
            </Card>
            <Card title="Resumen de productos">
              <ProductsSummary range={range} />
            </Card>
            <Card title="Nuevos clientes">
              <NewClients range={range} />
            </Card>
          </GraphsContainer>
        </div>
      )}
    </GeneralContainer>
  );
};

export default Dashboard;
