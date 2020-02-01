import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {Button, notification} from 'antd';
import {Link, Credit} from './elements';
import {ADD_TICKET_TO_TURN} from "./graphql/mutations";

class TicketPanel extends Component {
  addTicketToTurn = async ticket => {
    const {turn: {id}, onTurnUpdate, refetch, client} = this.props;

    try {
      const {data: {turnAddTicket: turn}} = await client.mutate({
        mutation: ADD_TICKET_TO_TURN, variables: {turn: {id, ticket}}
      });

      onTurnUpdate(turn);
      refetch();
    } catch(e) {
      notification.error({
        message: e.toString(),
      });
    }
  };

  render() {
    const {ticket, setCurrent, printTicket} = this.props;

    return (
      <React.Fragment>
        <table style={{width: '100%', margin: 10}}>
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
                <b>RAZÓN SOCIAL</b>
                {`: ${ticket.client.businessName}`}
              </td>
              <td>
                {ticket.driver && (
                  <React.Fragment>
                    <b>CONDUCTOR</b>
                    {`: ${ticket.driver}`}
                  </React.Fragment>
                )}
              </td>
              <td>
                {ticket.driver && (
                  <React.Fragment>
                    <b>TIPO</b>
                    {`: ${ticket.product.name}`}
                  </React.Fragment>
                )}
              </td>
            </tr>
            <tr>
              <td>
                <b>DIRECCIÓN</b>
                {`: ${ticket.client.address}`}
              </td>
              <td>
                <b>PLACAS</b>
                {`: ${ticket.truck.plates}`}
              </td>
              <td>
                {ticket.totalWeight && (
                  <React.Fragment>
                    <b>PESO NETO</b>
                    {`: ${ticket.totalWeight} tons`}
                  </React.Fragment>
                )}
              </td>
              <td />
            </tr>
            <tr>
              <td>
                <b>CÓDIGO POSTAL</b>
                {`: ${ticket.client.zipcode}`}
              </td>
              <td id="skip">
                <Link
                  link={ticket.inTruckImage}
                  href={ticket.inTruckImage}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <b>IMAGEN ENTRADA</b>
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <b>CRÉDITO: </b>
                <Credit credit={ticket.client.credit}>
                  {ticket.client.credit}
                </Credit>
              </td>
              <td id="skip">
                <Link
                  href={ticket.outTruckImage}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{color: !ticket.outTruckImage ? '#f5222d' : null}}
                >
                  <b>IMAGEN SALIDA</b>
                </Link>
              </td>
            </tr>
            <tr>
              <td />
              <td />
              <td>
                {ticket.weight && (
                    <React.Fragment>
                      <b>PESO BRUTO</b>
                      {`: ${ticket.weight} tons`}
                    </React.Fragment>
                )}
              </td>
            </tr>
            <tr>
              <td />
              <td />
              <td>
                <b>PESO CAMIÓN</b>
                {`: ${ticket.truck.weight} tons`}
              </td>
            </tr>
            <tr>
              <td />
              <td />
              <td>
                {ticket.totalPrice && (
                  <React.Fragment>
                    <b>TOTAL</b>
                    {`: $${ticket.totalPrice}`}
                  </React.Fragment>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <span id="skip">
          <Button
            style={{margin: 5}}
            type="danger"
            onClick={() => setCurrent(ticket, 'image')}
          >
            Tomar foto
          </Button>
          <Button
            style={{margin: 5}}
            type="primary"
            disabled={!ticket.outTruckImage}
            onClick={() => setCurrent(ticket, 'submit')}
          >
            Cobrar
          </Button>
          <Button
              style={{margin: 5}}
              onClick={() =>
                  printTicket(
                      <TicketPanel
                          ticket={ticket}
                          setCurrent={setCurrent}
                          printTicket={printTicket}
                      />
                  )
              }
              disabled={!ticket.totalPrice}
              type="primary"
          >
            Imprimir
          </Button>
          <Button
            style={{margin: 5}}
            type="dashed"
            disabled={!ticket.totalPrice}
            onClick={() => this.addTicketToTurn(ticket.id)}
          >
            Agregar a turno
          </Button>
        </span>
      </React.Fragment>
    );
  }
}

export default withApollo(TicketPanel);
