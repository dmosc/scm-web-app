import {gql} from 'apollo-boost';

const FILE_UPLOAD = gql`
  mutation imageUpload($image: Upload!, $folderKey: s3FolderKey!, $id: ID!) {
    imageUpload(image: $image, folderKey: $folderKey, id: $id)
  }
`;
const REGISTER_TICKET_INIT = gql`
  mutation ticketInit($plates: String!, $product: ID!, $inTruckImage: String!) {
    ticketInit(
      product: $product
      plates: $plates
      inTruckImage: $inTruckImage
    ) {
      id
      truck {
        plates
      }
    }
  }
`;

export {FILE_UPLOAD, REGISTER_TICKET_INIT};
