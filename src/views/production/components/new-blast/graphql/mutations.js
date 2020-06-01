import { gql } from 'apollo-boost';

const REGISTER_BLAST = gql`
    mutation blast($blast: BlastInput!) {
        blast(blast: $blast) {
            id
            date
            products {
                product {
                    name
                }
                price
                quantity
            }
            documents
            tons
            createdBy {
                id
                username
            }
        }
    }
`;

const FILE_UPLOAD = gql`
    mutation fileUpload($file: Upload!, $folderKey: s3FolderKey!, $id: ID!) {
        fileUpload(file: $file, folderKey: $folderKey, id: $id)
    }
`;

export { REGISTER_BLAST, FILE_UPLOAD };