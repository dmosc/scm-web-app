import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, message, Modal } from 'antd';
import { Table, Actions, Credit, Link } from './elements';
import { ADD_TICKET_TO_TURN, DISABLE_TICKET } from './graphql/mutations';

const { confirm } = Modal;

class TicketPanel extends Component {
  addTicketToTurn = async ticket => {
    const {
      turn: { id },
      refetchTickets,
      refetchTurn,
      client
    } = this.props;

    try {
      await client.mutate({ mutation: ADD_TICKET_TO_TURN, variables: { turn: { id, ticket } } });

      refetchTickets();
      refetchTurn();
    } catch (e) {
      message.error(e.toString());
    }
  };

  handleCancel = ticketId => {
    const { client, refetchTickets } = this.props;

    confirm({
      title: '¿Quieres cancelar esta boleta?',
      content:
        'Tendrás 24 horas para recuperar la boleta en la sección de boletas canceladas, después de eso, se perderá completamente',
      okText: 'Cancelar boleta',
      cancelText: 'Regresar',
      okType: 'danger',
      onOk: async () => {
        try {
          await client.mutate({
            mutation: DISABLE_TICKET,
            variables: { id: ticketId }
          });

          refetchTickets();

          message.success('La boleta ha sido cancelada correctamente');
        } catch (e) {
          message.error('Ha habido un error confirmando el cambio del producto');
        }
      },
      onCancel: () => {}
    });
  };

  render() {
    const { ticket, setCurrent, printTicket } = this.props;

    return (
      <>
        <Table>
          <thead>
            <tr>
              <td>
                <b>
                  <u>CLIENTE</u>
                </b>
              </td>
              <td>
                <b>
                  <u>CAMIÓN</u>
                </b>
              </td>
              <td>
                <b>
                  <u>PRODUCTO</u>
                </b>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>RAZÓN SOCIAL:</b>
                <p>{`${ticket.client.businessName}`}</p>
              </td>
              <td>
                {ticket.driver && (
                  <>
                    <b>CONDUCTOR:</b>
                    <p>{`${ticket.driver}`}</p>
                  </>
                )}
              </td>
              <td>
                {ticket.product && (
                  <>
                    <b>TIPO:</b>
                    <p>{`${ticket.product.name}`}</p>
                  </>
                )}
              </td>
            </tr>
            <tr>
              <td>
                <b>DIRECCIÓN:</b>
                <p>{`${ticket.client.address?.street}`}</p>
              </td>
              <td>
                <b>PLACAS:</b>
                <p>{`${ticket.truck.plates}`}</p>
              </td>
              <td>
                {ticket.totalWeight && (
                  <>
                    <b>PESO NETO:</b>
                    <p>{`${ticket.totalWeight} tons`}</p>
                  </>
                )}
              </td>
              <td />
            </tr>
            <tr>
              <td>
                <b>CÓDIGO POSTAL: </b>
                <p>{`${ticket.client.address?.zipcode}`}</p>
              </td>
              <td>
                <Link
                  id="skip"
                  link={ticket.inTruckImage}
                  href={ticket.inTruckImage}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <b>IMAGEN ENTRADA</b>
                </Link>
              </td>
              <td>
                {ticket.weight && (
                  <>
                    <b>PESO BRUTO: </b>
                    {`${ticket.weight} tons`}
                  </>
                )}
              </td>
            </tr>
            <tr>
              <td>
                <b>BALANCE: </b>
                <Credit credit={ticket.client.balance}>{ticket.client.balance}</Credit>
              </td>
              <td>
                <Link
                  id="skip"
                  href={ticket.outTruckImage}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ color: !ticket.outTruckImage ? '#f5222d' : null }}
                >
                  <b>IMAGEN SALIDA</b>
                </Link>
              </td>
              <td>
                <b>PESO CAMIÓN</b>
                {`: ${ticket.truck.weight} tons`}
              </td>
            </tr>
            <tr>
              <td className="hide">
                <b>
                  <u>CONSIGNADO</u>
                </b>
              </td>
              <td />
              <td />
            </tr>
            <tr>
              <td className="hide">
                Matriz
                <br />
                Matriz
              </td>
              <td />
              <td />
            </tr>
            <tr>
              <td className="hide">Santa Catarina, Nuevo León</td>
              <td />
              <td>
                {ticket.totalPrice && (
                  <>
                    <b>TOTAL</b>
                    {`: $${ticket.totalPrice}`}
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </Table>
        <Actions id="skip">
          <Button
            icon="camera"
            size="small"
            type="danger"
            onClick={() => setCurrent(ticket, 'image')}
          >
            Tomar foto
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={!ticket.outTruckImage}
            onClick={() => setCurrent(ticket, 'submit')}
            icon="money-collect"
          >
            Cobrar
          </Button>
          <Button
            size="small"
            onClick={() =>
              printTicket(
                <TicketPanel ticket={ticket} setCurrent={setCurrent} printTicket={printTicket} />
              )
            }
            disabled={!ticket.totalPrice}
            type="primary"
            icon="printer"
          >
            Imprimir
          </Button>
          <Button
            size="small"
            type="dashed"
            disabled={!ticket.totalPrice}
            onClick={() => this.addTicketToTurn(ticket.id)}
            icon="plus"
          >
            Agregar a turno
          </Button>
          <Button
            style={{ marginLeft: 'auto' }}
            size="small"
            onClick={() => this.handleCancel(ticket.id)}
            type="danger"
            ghost
            icon="close"
          >
            Cancelar
          </Button>
        </Actions>
      </>
    );
  }
}

TicketPanel.propTypes = {
  ticket: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  turn: PropTypes.object.isRequired,
  refetchTickets: PropTypes.func.isRequired,
  refetchTurn: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired,
  printTicket: PropTypes.func.isRequired
};

export default withApollo(TicketPanel);
