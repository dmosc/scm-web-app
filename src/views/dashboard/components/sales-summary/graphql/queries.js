import { gql } from 'apollo-boost';

const GET_SUMMARY = gql`
    query ticketsSummary(
        $range: DateRange
        $turnId: ID
        $billType: TicketBillType
        $paymentType: TicketPaymentType
    ) {
        ticketsSummary(range: $range, turnId: $turnId, billType: $billType, paymentType: $paymentType) {
            upfront
            credit
            total
            upfrontWeight
            creditWeight
        }
    }
`;

export { GET_SUMMARY };