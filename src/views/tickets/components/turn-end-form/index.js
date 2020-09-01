import React, { Component } from 'react';
import { format } from 'utils/functions';
import { withApollo } from 'react-apollo';
import { Button, Collapse, Drawer, Form, Icon, notification, Row, Tag, Typography } from 'antd';
import periods from 'utils/enums/periods';
import { sizes } from 'theme';
import {
  CollapseContainer,
  Column,
  ColumnTitle,
  Time,
  TimesContainer,
  TitleTime
} from './elements';
import { END_TURN } from './graphql/mutations';
import { GET_REPORT, GET_TURN_SUMMARY } from './graphql/queries';

const { Title, Text } = Typography;
const { Panel } = Collapse;

class TurnEndForm extends Component {
  state = {
    loading: false,
    downloading: false,
    showSummary: false,
    summary: null,
    ticketCount: 0,
    date: new Date(),
    isLg: window.innerWidth > sizes.lg
  };

  updateWidth = () => {
    this.setState({ isLg: window.innerWidth > sizes.lg });
  };

  componentDidMount = async () => {
    this.clockID = setInterval(() => this.tick(), 1000);
    window.addEventListener('resize', this.updateWidth);
  };

  componentWillUnmount = () => {
    clearInterval(this.clockID);
    window.removeEventListener('resize', this.updateWidth);
  };

  getSummary = async () => {
    const { client, turnActive } = this.props;

    const {
      data: { turnSummary: summary }
    } = await client.query({
      query: GET_TURN_SUMMARY,
      variables: { uniqueId: turnActive.uniqueId },
      fetchPolicy: 'network-only'
    });
    const ticketCount = summary.clients.reduce((total, { count }) => (total += count), 0);

    this.setState({ summary, ticketCount }, this.toggleSummary);
  };

  toggleSummary = () => {
    const { showSummary } = this.state;
    this.setState({ showSummary: !showSummary });
  };

  handleSubmit = e => {
    const {
      form,
      turnActive: { id },
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(async err => {
      if (!err) {
        try {
          await client.mutate({ mutation: END_TURN, variables: { turn: { id } } });
        } catch (e) {
          notification.error({ message: e.toString() });
        }

        this.setState({ loading: false });
      } else {
        notification.error({ message: '¡Ha habido un error intentando terminar el turno!' });
        this.setState({ loading: false }, this.toggleSummary);
      }
    });
  };

  downloadReport = async () => {
    const { turnActive, client } = this.props;
    const { date } = this.state;
    this.setState({ downloading: true });

    const {
      data: { turnSummaryXLS }
    } = await client.query({ query: GET_REPORT, variables: { uniqueId: turnActive.uniqueId } });

    const start = new Date(turnActive.start);

    const link = document.createElement('a');
    link.href = encodeURI(turnSummaryXLS);
    link.download = `TURNO-${
      periods[turnActive.period]
    }-${start.toISOString()}-${date.toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    this.setState({ downloading: false });
  };

  tick = () => this.setState({ date: new Date() });

  render() {
    const { turnActive } = this.props;
    const { loading, downloading, showSummary, summary, ticketCount, date, isLg } = this.state;

    return (
      <>
        <TimesContainer>
          <Time>
            <span>Turno empezó: </span>
            <TitleTime>{new Date(turnActive.start).toLocaleTimeString()}</TitleTime>
          </Time>
          <Time>
            <span>Turno termina: </span>
            <TitleTime>{date.toLocaleTimeString()}</TitleTime>
          </Time>
        </TimesContainer>
        <Form.Item>
          <Tag color="#faad14">{periods[turnActive.period]}</Tag>
          <Button block icon="pie-chart" onClick={this.getSummary}>
            {(loading && 'Espere..') || 'Resumen'}
          </Button>
        </Form.Item>
        {summary && (
          <Drawer
            title="CORTE DE CAJA"
            width={isLg ? '50%' : '100%'}
            visible={showSummary}
            onClose={this.toggleSummary}
          >
            <Row
              type="flex"
              justify="space-around"
              align="middle"
              gutter={{ xs: 8, sm: 16, md: 24 }}
            >
              <Column span={6}>
                <ColumnTitle color="#eb2f96">BOLETAS</ColumnTitle>
                <Title level={4}>{ticketCount}</Title>
              </Column>
              <Column span={6}>
                <ColumnTitle color="#52c41a">CONTADO</ColumnTitle>
                <Title level={4}>{format.currency(summary.upfront)}</Title>
              </Column>
              <Column span={6}>
                <ColumnTitle color="#f5222d">CRÉDITO</ColumnTitle>
                <Title level={4}>{format.currency(summary.credit)}</Title>
              </Column>
              <Column span={6}>
                <ColumnTitle color="#1890ff">TOTAL</ColumnTitle>
                <Title level={4}>{format.currency(summary.total)}</Title>
              </Column>
            </Row>
            <Row>
              <CollapseContainer
                bordered={false}
                expandIcon={({ isActive }) => (
                  <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                )}
              >
                {summary.clients.map(({ info, count, tickets }) => (
                  <Panel key={info.id} header={info.businessName} extra={count}>
                    <Collapse
                      expandIcon={({ isActive }) => (
                        <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                      )}
                    >
                      {tickets.map(ticket => (
                        <Panel
                          key={ticket.id}
                          header={ticket.folio}
                          extra={`$${ticket.totalPrice}`}
                        >
                          <Row
                            style={{ margin: 5, padding: 10 }}
                            gutter={{ xs: 8, sm: 16, md: 24 }}
                          >
                            <Column span={6}>
                              <Text code>PESO NETO</Text>
                              <Title level={4}>{`${format.currency(
                                ticket.totalWeight
                              )} tons`}</Title>
                            </Column>
                            <Column span={6}>
                              <Text code>SUBTOTAL</Text>
                              <Title level={4}>
                                {format.currency(ticket.totalPrice - ticket.tax)}
                              </Title>
                            </Column>
                            <Column span={6}>
                              <Text code>IMPUESTO</Text>
                              <Title level={4}>{format.currency(ticket.tax)}</Title>
                            </Column>
                            <Column span={6}>
                              <Text code>TOTAL</Text>
                              <Title level={4}>{format.currency(ticket.totalPrice)}</Title>
                            </Column>
                          </Row>
                        </Panel>
                      ))}
                    </Collapse>
                  </Panel>
                ))}
              </CollapseContainer>
            </Row>
            <Row style={{ margin: 10 }} type="flex" justify="end" align="middle">
              <Button
                type="primary"
                icon="file-excel"
                style={{ margin: '0px 5px' }}
                loading={downloading}
                onClick={this.downloadReport}
              >
                {(loading && 'Espere..') || 'Resumen'}
              </Button>
              {isLg && (
                <Button
                  type="danger"
                  htmlType="submit"
                  icon="stop"
                  style={{ margin: '0px 5px' }}
                  loading={loading}
                  onClick={this.handleSubmit}
                >
                  {(loading && 'Espere..') || 'Terminar turno'}
                </Button>
              )}
            </Row>
          </Drawer>
        )}
      </>
    );
  }
}

export default withApollo(TurnEndForm);
