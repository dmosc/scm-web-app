import React, {Component} from 'react';
import {graphql} from '@apollo/react-hoc';
import {Collapse} from "antd";
import TicketPanel from "./components/ticket-panel";
import {LoadingBar, LoadingBarContainer} from "./elements";
import {GET_TICKETS} from "../../graphql/queries";
import {ACTIVE_TICKETS, TICKET_UPDATE} from "./graphql/subscriptions";

const {Panel} = Collapse;

class TicketList extends Component {
    componentDidMount = () => {
        const { data: { subscribeToMore }} = this.props;

        if(!this.unsubscribeToActiveTickets) this.unsubscribeToActiveTickets = this.subscribeToActiveTickets(subscribeToMore);
        if(!this.unsubscribeToTicketUpdates) this.unsubscribeToTicketUpdates = this.subscribeToTicketUpdates(subscribeToMore);
    };

    componentWillUnmount = () => {
        this.unsubscribeToActiveTickets();
        this.unsubscribeToTicketUpdates();
    };

    subscribeToActiveTickets = subscribeToMore => {
        return subscribeToMore({
            document: ACTIVE_TICKETS,
            updateQuery: (prev, {subscriptionData: {data}}) => {
                const {activeTickets} = data;
                if (!activeTickets) return prev;

                const tickets = [...activeTickets];

                return {tickets};
            },
        });
    };

    subscribeToTicketUpdates = subscribeToMore => {
        return subscribeToMore({
            document: TICKET_UPDATE,
            updateQuery: (prev, {subscriptionData: {data}}) => {
                const {tickets: oldTickets} = prev;
                const {ticketUpdate} = data;
                if (!ticketUpdate) return prev;

                let tickets = [...oldTickets];

                for (let i = 0; i < oldTickets.length; i++)
                    if (ticketUpdate.id === oldTickets[i].id)
                        if(ticketUpdate.turn) tickets = tickets.splice(i, 1);
                        else tickets[i] = ticketUpdate;

                return {tickets};
            }
        });
    };

    render() {
        const {turnActive, setCurrent, printTicket, loading, error, data, refetch} = this.props;

        if (loading) return <div>Cargando boletas...</div>;
        if (error) return <div>¡No se han podido cargar las boletas!</div>;

        const {tickets} = data;

        return (
            tickets?.length === 0 ?
                <div>No hay tickets disponibles</div> :
                <Collapse accordion bordered={false}>
                    {tickets?.filter(ticket => !ticket.turn).map(ticket => (
                        <Panel
                            disabled={!turnActive}
                            key={ticket.id}
                            header={`${ticket.truck.plates}`}
                            extra={
                                <LoadingBarContainer>
                                    <LoadingBar
                                        disabled={!turnActive}
                                        totalPrice={ticket.totalPrice}
                                        outTruckImage={ticket.outTruckImage}
                                    />
                                </LoadingBarContainer>
                            }
                        >
                            <TicketPanel
                                ticket={ticket}
                                turn={turnActive}
                                refetch={refetch}
                                setCurrent={setCurrent}
                                printTicket={printTicket}
                            />
                        </Panel>
                    ))}
                </Collapse>
        );
    }
}

export default graphql(GET_TICKETS, {options: () => ({variables: {filters: {}}})})(TicketList);