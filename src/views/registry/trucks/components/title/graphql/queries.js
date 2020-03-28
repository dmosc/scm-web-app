import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query trucksXLS($filters: TruckFilters!) {
    trucksXLS(filters: $filters)
  }
`;

export { GET_REPORT };
