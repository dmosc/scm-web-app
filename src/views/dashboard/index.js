import React, { useState } from 'react';
import { Col, DatePicker, Row, Typography } from 'antd';
import moment from 'moment-timezone';
import Container from 'components/common/container';
import PostsList from './components/posts-list';
import SalesSummary from './components/sales-summary';
import NewClients from './components/new-clients';
import ProductsSummary from './components/products-summary';
import Goals from './components/goals';
import { InputContainer } from './elements';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Dashboard = () => {
  const [range, setRange] = useState({
    start: moment().startOf('month'),
    end: moment().endOf('month')
  });

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
    <>
      <Row gutter={[0, 0]}>
        <Col span={8}>
          <Container title="Posts recientes">
            <PostsList />
          </Container>
        </Col>
        <Row gutter={[0, 0]}>
          <Col span={10}>
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
          </Col>
          <Col span={8}>
            <Row gutter={[0, 0]}>
              <Col span={20}>
                <Container title="Resumen de ventas" width="100%">
                  <SalesSummary range={range} />
                </Container>
              </Col>
            </Row>
            <Row gutter={[0, 0]}>
              <Col span={20}>
                <Container title="Metas" width="100%">
                  <Goals />
                </Container>
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={20}>
                <Container title="Resumen de productos" width="100%">
                  <ProductsSummary range={range} />
                </Container>
              </Col>
            </Row>
            <Row>
              <Col span={20}>
                <Container title="Nuevos clientes" width="100%">
                  <NewClients range={range} />
                </Container>
              </Col>
            </Row>
          </Col>
        </Row>
      </Row>
    </>
  );
};

export default Dashboard;
