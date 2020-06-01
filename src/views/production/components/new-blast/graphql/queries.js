import { gql } from 'apollo-boost';

const GET_BLAST_PRODUCTS = gql`
  query blastProducts($filters: BlastProductFilters!) {
    blastProducts(filters: $filters) {
      id
      name
      description
    }
  }
`;

export { GET_BLAST_PRODUCTS };
