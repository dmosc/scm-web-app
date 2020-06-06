import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const GeneralContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-gap: 30px;
  padding: 20px;
`;

const GraphsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
`;

export { InputContainer, GeneralContainer, GraphsContainer };
