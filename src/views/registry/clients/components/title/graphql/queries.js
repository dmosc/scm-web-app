import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query clientsXLS($filters: ClientFilters!) {
    clientsXLS(filters: $filters)
  }
`;

export { GET_REPORT };
