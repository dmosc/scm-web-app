import { gql } from 'apollo-boost';

const FILE_UPLOAD = gql`
    mutation imageUpload($image: String!, $folderKey: s3FolderKey!, $id: ID!) {
        imageUpload(image: $image, folderKey: $folderKey, id: $id)
    }
`;

const TICKET_OUT_IMAGE_SUBMIT = gql`
  mutation ticketProductLoad($ticket: TicketProductLoadInput!) {
    ticketProductLoad(ticket: $ticket) {
      outTruckImage
    }
  }
`;

export { FILE_UPLOAD, TICKET_OUT_IMAGE_SUBMIT };
