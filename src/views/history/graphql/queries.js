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
    ) {
      id
      folio
      driver
      client {
        id
        firstName
        lastName
        businessName
        rfc
      }
      truck {
        id
        plates
        weight
      }
      weight
      totalWeight
      totalPrice
      tax
      product {
        id
        name
      }
      inTruckImage
      outTruckImage
      out
    }
  }
`;

const GET_PDF = gql`
  query ticketPDF($idOrFolio: String!) {
    ticketPDF(idOrFolio: $idOrFolio)
  }
`;

export { GET_HISTORY_TICKETS, GET_PDF };
