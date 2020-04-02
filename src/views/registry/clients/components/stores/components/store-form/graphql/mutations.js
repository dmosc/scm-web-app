import { gql } from 'apollo-boost';

const REGISTER_NEW_CLIENT_STORE = gql`
  mutation store($store: StoreInput!) {
    store(store: $store) {
      id
      address
      name
      state
      municipality
    }
  }
`;

const EDIT_CLIENT_STORE = gql`
  mutation storeEdit($store: StoreEditInput!) {
    storeEdit(store: $store) {
      id
      address
      name
      state
      municipality
    }
  }
`;

export { REGISTER_NEW_CLIENT_STORE, EDIT_CLIENT_STORE };
