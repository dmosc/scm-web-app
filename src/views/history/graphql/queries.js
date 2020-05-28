import { gql } from 'apollo-boost';

const GET_HISTORY_TICKETS = gql`
  query archivedTickets($filters: ArchivedTicketFilters!) {
    archivedTickets(filters: $filters) {
      id
      folio
      driver
      client
      businessName
      rfc
      plates
      truckWeight
      totalWeight
      tons
      product
      price
      tax
      total
      inTruckImage
      outTruckImage
      createdAt
      updatedAt
    }
  }
`;

const GET_PDF = gql`
  query ticketPDF($idOrFolio: String!) {
    ticketPDF(idOrFolio: $idOrFolio)
  }
`;

export { GET_HISTORY_TICKETS, GET_PDF };
