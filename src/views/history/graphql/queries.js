import { gql } from 'apollo-boost';

const GET_HISTORY_TICKETS = gql`
  query archivedTickets(
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
    $paymentType: TicketPaymentType
    $clientIds: [ID]
    $truckId: ID
    $productId: ID
    $folio: String
    $sortBy: TicketSort
  ) {
    archivedTickets(
      range: $range
      turnId: $turnId
      billType: $billType
      paymentType: $paymentType
      clientIds: $clientIds
      truckId: $truckId
      productId: $productId
      folio: $folio
      sortBy: $sortBy
    ) {
      id
      folio
      out
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      totalPrice
      product {
        id
        name
      }
      tax
    }
  }
`;

const GET_PDF = gql`
  query ticketPDF($idOrFolio: String!) {
    ticketPDF(idOrFolio: $idOrFolio)
  }
`;

export { GET_HISTORY_TICKETS, GET_PDF };
