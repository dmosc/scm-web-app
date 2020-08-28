import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment-timezone';
import { useAuth } from 'components/providers/withAuth';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { format, printPDF } from 'utils/functions';
import { Button, Form, InputNumber, message, Modal, notification, Row, Table, Tag, Tooltip, Typography } from 'antd';
import Title from './components/title';
import Audit from './components/audit';
import { Card, HistoryContainer, TableContainer } from './elements';
import { GET_HISTORY_TICKETS, GET_PDF } from './graphql/queries';
import { DELETE_TICKET, TICKET_TO_BILL, TICKET_TO_NO_BILL, TICKET_UPDATE_PRICE } from './graphql/mutations';

const { Text } = Typography;
const { confirm } = Modal;

const History = ({ client }) => {
  const [filters, setFilters] = useState({
    range: {
      start: moment().subtract(1, 'month'),
      end: moment()
    },
    turnId: '',
    billType: null,
    paymentType: null,
    clientIds: [],
    truckId: '',
    productId: '',
    folio: '',
    sortBy: {
      field: 'folio',
      order: 'desc'
    }
  });
  const { isAdmin, isManager, isSupport } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [results, setResults] = useState(0);
  const [ticketAuditing, setTicketAuditing] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(undefined);
  const [shouldSubmitPriceUpdate, setShouldSubmitPriceUpdate] = useState(false);
  const debouncedFolio = useDebounce(filters.folio, 500);

  useEffect(() => {
    if (shouldSubmitPriceUpdate) {
      (async () => {
        const { data: { ticketUpdatePrice: ticket } } = await client.mutate({
          mutation: TICKET_UPDATE_PRICE,
          variables: { id: currentTicket.id, price: currentTicket.totalPrice }
        });

        ticket.subtotal = ticket.totalPrice - ticket.tax;
        ticket.businessName = ticket.client.businessName;
        ticket.plates = ticket.truck.plates;
        ticket.product = ticket.product.name;

        if (ticket) {
          const ticketsToSet = tickets.map(ticketInList => ticketInList.id === ticket.id ? ticket : ticketInList);
          setTickets(ticketsToSet);
          message.success('La boleta ha sido actualizada exitosamente!');
        } else {
          message.error('Ha sucedido un error intentando actualizar la boleta!');
        }
      })();

      setShouldSubmitPriceUpdate(false);
    }
  }, [client, tickets, currentTicket, shouldSubmitPriceUpdate]);

  const handleFilterChange = (key, value) => {
    // eslint-disable-next-line no-param-reassign
    if (key === 'type' && value === '') value = null;
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    setFilters({
      ...filters,
      range: {
        start,
        end
      }
    });
  };

  const downloadPDF = async id => {
    const {
      data: { ticketPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        idOrFolio: id
      }
    });

    await printPDF(ticketPDF);
  };

  const ticketUpdateSeries = ticketToUpdate => {
    confirm({
      title: `¿Estás seguro de que deseas cambiar la serie de la boleta ${ticketToUpdate.folio}?`,
      content:
        'Una vez modificada, se realizarán los ajustes necesarios a lo largo del sistema.',
      okType: 'danger',
      okText: 'Modificar',
      cancelText: 'Cancelar',
      onOk: async () => {
        const { data } = await client.mutate({
          mutation: ticketToUpdate.bill ? TICKET_TO_NO_BILL : TICKET_TO_BILL,
          variables: { id: ticketToUpdate.id }
        });

        const ticket = data.ticketToBill ?? data.ticketToNoBill;

        ticket.subtotal = ticket.totalPrice - ticket.tax;
        ticket.businessName = ticket.client.businessName;
        ticket.plates = ticket.truck.plates;
        ticket.product = ticket.product.name;

        if (ticket) {
          const ticketsToSet = [ticket, ...tickets.filter(({ id }) => id !== ticket.id)];
          setTickets(ticketsToSet);
          message.success(`La boleta ha sido actualizada a ${ticket.folio}!`);
        } else {
          message.error('Ha sucedido un error intentando actualizar la boleta!');
        }
      },
      onCancel: () => {
      }
    });
  };

  const ticketUpdatePrice = ticketToUpdate => {
    confirm({
      title: `Una vez modificando el precio de ${ticketToUpdate.folio}, cualquier efecto secundario o inconsistencias son responsabilidad del que está modificando.`,
      content:
        <Form>
          <Form.Item required label="Precio de la boleta">
            <InputNumber
              style={{ width: '70%' }}
              defaultValue={ticketToUpdate.totalPrice}
              onChange={price => setCurrentTicket({ ...ticketToUpdate, totalPrice: price })}
              placeholder="Precio de la boleta"
              min={0}
              step={0.01}
              formatter={price => `$${price}`}
            />
          </Form.Item>
        </Form>,
      okType: 'danger',
      okText: 'Modificar',
      cancelText: 'Cancelar',
      onOk: async () => setShouldSubmitPriceUpdate(true),
      onCancel: () => {
      }
    });
  };

  const deleteTicket = ticketToDelete => {
    confirm({
      title: `¿Estás seguro de que deseas eliminar la boleta ${ticketToDelete.folio}?`,
      content:
        'Una vez eliminada, ya no será considerada en el sistema ni será posible recuperarla.',
      okType: 'danger',
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        const {
          data: { ticketDelete }
        } = await client.mutate({
          mutation: DELETE_TICKET,
          variables: { id: ticketToDelete.id }
        });

        if (ticketDelete) {
          setTickets(tickets.filter(({ id }) => id !== ticketToDelete.id));
          message.success(`La boleta ${ticketToDelete.folio} ha sido removida!`);
        } else {
          message.error('Ha sucedido un error intentando eliminar la boleta!');
        }
      },
      onCancel: () => {
      }
    });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { archivedTickets }
        } = await client.query({
          query: GET_HISTORY_TICKETS,
          variables: {
            range: filters.range,
            turnId: filters.turnId,
            billType: filters.billType,
            paymentType: filters.paymentType,
            clientIds: filters.clientIds.map(composedId => composedId.split(':')[1]),
            truckId: filters.truckId,
            productId: filters.productId,
            folio: debouncedFolio,
            client: filters.client,
            sortBy: filters.sortBy
          }
        });

        const archivedTicketsToSet = archivedTickets.map(ticket => ({
          ...ticket,
          subtotal: ticket.totalPrice - ticket.tax,
          businessName: ticket.client.businessName,
          plates: ticket.truck.plates,
          product: ticket.product.name
        }));

        setTickets(archivedTicketsToSet);
        setResults(archivedTicketsToSet.length);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: '¡No se han podido cargar las boletas correctamente!'
        });
      }
    };

    getData();
  }, [
    filters.range,
    filters.turnId,
    filters.billType,
    filters.paymentType,
    filters.clientIds,
    filters.truckId,
    filters.productId,
    filters.sortBy,
    debouncedFolio,
    filters.client,
    client
  ]);

  const columns = [
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio',
      width: 80
    },
    {
      title: 'Fecha',
      dataIndex: 'out',
      key: 'out',
      width: 130,
      render: out => (
        <>
          <Tag color="geekblue">{moment(out).format('DD/MM/YYYY')}</Tag>
          <Tag color="purple">{moment(out).format('HH:MM A')}</Tag>
        </>
      )
    },
    {
      title: 'Negocio',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 250
    },
    {
      title: 'Placas',
      dataIndex: 'plates',
      key: 'plates',
      width: 100
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      width: 100
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: subtotal => <Tag>{format.currency(subtotal)}</Tag>
    },
    {
      title: 'Impuesto',
      dataIndex: 'tax',
      key: 'tax',
      width: 120,
      render: tax => <Tag>{format.currency(tax)}</Tag>
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: total => <Tag>{format.currency(total)}</Tag>
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Imprimir">
            <Button
              onClick={() => downloadPDF(row.id)}
              type="primary"
              icon="printer"
              size="small"
            />
          </Tooltip>
          {(isAdmin || isManager) && (
            <Tooltip placement="top" title="Auditoría">
              <Button
                style={{ marginLeft: 5 }}
                onClick={() => setTicketAuditing(row.id)}
                icon="monitor"
                size="small"
              />
            </Tooltip>
          )}
          {(isAdmin || isManager || isSupport) && (
            <Tooltip placement="top" title={`Convertir a ${row.bill ? 'REMISIÓN' : 'FACTURA'}`}>
              <Button
                style={{ marginLeft: 5 }}
                onClick={() => ticketUpdateSeries(row)}
                type="default"
                icon="sync"
                size="small"
              />
            </Tooltip>
          )}
          {(isAdmin || isManager) && (
            <Tooltip placement="top" title="Modificar precio">
              <Button
                style={{ marginLeft: 5 }}
                onClick={() => {
                  setCurrentTicket(row);
                  ticketUpdatePrice(row);
                }}
                type="default"
                icon="dollar"
                size="small"
              />
            </Tooltip>
          )}
          {(isAdmin || isManager) && (
            <Tooltip placement="top" title="Eliminar">
              <Button
                style={{ marginLeft: 5 }}
                onClick={() => deleteTicket(row)}
                type="danger"
                icon="delete"
                size="small"
              />
            </Tooltip>
          )}
        </Row>
      )
    }
  ];

  return (
    <HistoryContainer>
      <Audit
        ticketAuditing={ticketAuditing}
        visible={!!ticketAuditing}
        onClose={() => setTicketAuditing(null)}
      />
      <TableContainer>
        <Card bordered={false}>
          <Table
            loading={loading}
            columns={columns}
            title={() => (
              <Title
                style={{ margin: 'auto 10px' }}
                level={3}
                filters={filters}
                results={results}
                handleFilterChange={handleFilterChange}
                handleDateFilterChange={handleDateFilterChange}
              />
            )}
            footer={ticketsToAdd => {
              let subtotal = 0;
              let tax = 0;
              let total = 0;

              ticketsToAdd.forEach(
                ({ subtotal: ticketSubtotal, tax: ticketTax, totalPrice: ticketTotal }) => {
                  subtotal += ticketSubtotal;
                  tax += ticketTax;
                  total += ticketTotal;
                }
              );

              return (
                <div style={{ display: 'flex' }}>
                  <Text style={{ marginRight: 10 }}>
                    Subtotal <Tag>{format.currency(subtotal)}</Tag>
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    Impuestos <Tag>{format.currency(tax)}</Tag>
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    Total <Tag>{format.currency(total)}</Tag>
                  </Text>
                </div>
              );
            }}
            size="small"
            scroll={{ x: true, y: '42vh' }}
            pagination={{ defaultPageSize: 40 }}
            dataSource={tickets.map(ticket => ({ ...ticket, key: shortid.generate() }))}
          />
        </Card>
      </TableContainer>
    </HistoryContainer>
  );
};

History.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(History);
