import { gql } from 'apollo-boost';

const GET_PDF = gql`
  query ticketPDF($idOrFolio: String!) {
    ticketPDF(idOrFolio: $idOrFolio)
  }
`;

export { GET_PDF };
