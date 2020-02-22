import styled from 'styled-components';

const ProductSalesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  padding: 20px;
  gap: 10px;
`;

const FiltersContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  padding-top: 5px;
  border-top: 1px solid lightGrey;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 220px;
  height: 220px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.width ?? '100%'};
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0px;
`;

export { ProductSalesContainer, FiltersContainer, MessageContainer, Column, InputContainer };
