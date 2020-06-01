import { gql } from 'apollo-boost';

const REGISTER_BLAST_PRODUCT = gql`
    mutation blastProduct($blastProduct: BlastProductInput!) {
        blastProduct(blastProduct: $blastProduct) {
            id
            name
        }
    }
`;

export { REGISTER_BLAST_PRODUCT };