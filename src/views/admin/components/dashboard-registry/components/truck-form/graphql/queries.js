import {gql} from 'apollo-boost';

const GET_TRUCKS = gql`
  query trucks($filters: TruckFilters!) {
    trucks(filters: $filters) {
      id
      plates
      drivers
    }
  }
`;

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      businessName
    }
  }
`;

export {GET_TRUCKS, GET_CLIENTS};
