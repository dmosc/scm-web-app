import { gql } from 'apollo-boost';

const FILE_UPLOAD = gql`
  mutation imageUpload($image: Upload!, $folderKey: s3FolderKey!, $id: ID!) {
    imageUpload(image: $image, folderKey: $folderKey, id: $id)
  }
`;
const REGISTER_TICKET_INIT = gql`
  mutation ticketInit($ticket: TicketInitInput!) {
    ticketInit(ticket: $ticket) {
      id
      truck {
        plates
      }
    }
  }
`;

export { FILE_UPLOAD, REGISTER_TICKET_INIT };
