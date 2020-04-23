import styled from 'styled-components';

const NewQuotationForm = styled.form`
  display: flex;

  .ant-select-selection-selected-value {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
  }
`;

const Footer = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: right;
`;

export { NewQuotationForm, Footer };
