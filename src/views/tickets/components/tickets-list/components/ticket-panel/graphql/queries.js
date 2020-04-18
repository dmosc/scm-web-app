import { gql } from 'apollo-boost';

const GET_PDF = gql`
  query ticketPDF($id: ID!) {
    ticketPDF(id: $id)
  }
`;

export { GET_PDF };
