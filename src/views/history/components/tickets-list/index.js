import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import { Col, Row, DatePicker, Input, Typography, Radio, Icon } from 'antd';

const { Search } = Input;
const { Group, Button } = Radio;
const { Text } = Typography;
const { RangePicker } = DatePicker;

class TicketsList extends Component {
  state = {
    filters: {
      search: '',
      start: null,
      end: null,
      date: -1,
      price: -1
    }
  };

  handleFilterChange = (key, value) => {
    const { filters: oldFilters } = this.state;

    const filters = { ...oldFilters, [key]: value };

    this.setState({ filters }, this.getInventory);
  };

  handleDateFilterChange = dates => {
    const { filters: oldFilters } = this.state;

    const start = dates[0];
    const end = dates[1];
    const filters = { ...oldFilters, start, end };

    this.setState({ filters }, this.getInventory);
  };

  render() {
    return (
      <Row type="flex" justify="center">
        <Col span={9}>
          <Search
            placeholder="Filtrar por camión o cliente"
            onChange={({ target: { value } }) => this.handleFilterChange('search', value)}
            style={{ width: 250, margin: 5 }}
          />
        </Col>

        <Col span={8}>
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
            onChange={dates => this.handleDateFilterChange(dates)}
          />
          <Text style={{ margin: 5 }} disabled>
            Fecha:
          </Text>
        </Col>
        <Col span={3}>
          <Group
            style={{ margin: 5 }}
            defaultValue={-1}
            onChange={({ target: { value } }) => this.handleFilterChange('date', value)}
          >
            <Button value={1}>
              <Icon type="up" />
            </Button>
            <Button value={-1}>
              <Icon type="down" />
            </Button>
          </Group>
          <Text style={{ margin: 5 }} disabled>
            Fecha:
          </Text>
        </Col>
      </Row>
    );
  }
}

export default withApollo(TicketsList);
