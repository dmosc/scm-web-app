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

    const price = ticket.client.prices[ticket.product.name]
        ? ticket.client.prices[ticket.product.name]
        : ticket.product.price;

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
                <b>TIPO</b>
                {`: ${ticket.product.name}`}
              </td>
            </tr>
            <tr>
              <td>
                <b>NOMBRE</b>
                {`: ${ticket.client.firstName}, ${ticket.client.lastName}`}
              </td>
              <td>
                <b>PLACAS</b>
                {`: ${ticket.truck.plates}`}
              </td>
              <td>
                <b>PRECIO POR TONELADA</b>
                {`: ${price}`}
              </td>
            </tr>
            <tr>
              <td>
                <b>DIRECCIÓN</b>
                {`: ${ticket.client.address}`}
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
                <b>RFC</b>
                {`: ${ticket.client.rfc}`}
              </td>
              <td id="skip">
                {(!ticket.outTruckImage && (
                  <Button
                    type="link"
                    style={{
                      margin: 0,
                      padding: 0,
                      height: 'fit-content',
                      color: '#f5222d',
                    }}
                    onClick={() => setCurrent(ticket, 'image')}
                  >
                    <b>IMAGEN SALIDA</b>
                  </Button>
                )) || (
                  <Link
                    href={ticket.outTruckImage}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <b>IMAGEN SALIDA</b>
                  </Link>
                )}
              </td>
            </tr>
            <tr>
              <td>
                <b>CRÉDITO: </b>
                <Credit credit={ticket.client.credit}>
                  {ticket.client.credit}
                </Credit>
              </td>
              <td>
                <b>PESO</b>
                {`: ${ticket.truck.weight}`}
              </td>
            </tr>
            <tr>
              <td />
              <td>
                {ticket.weight && (
                  <React.Fragment>
                    <b>PESO BRUTO</b>
                    {`: ${ticket.weight}`}
                  </React.Fragment>
                )}
              </td>
              <td />
            </tr>
            <tr>
              <td />
              <td>
                {ticket.totalWeight && (
                  <React.Fragment>
                    <b>PESO NETO</b>
                    {`: ${ticket.totalWeight}`}
                  </React.Fragment>
                )}
              </td>
              <td>
                {ticket.totalPrice && (
                  <React.Fragment>
                    <b>TOTAL</b>
                    {`: ${ticket.totalPrice}`}
                  </React.Fragment>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <span id="skip">
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
            type="primary"
            disabled={!ticket.outTruckImage}
            onClick={() => setCurrent(ticket, 'submit')}
          >
            Completar datos
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
