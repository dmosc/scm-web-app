import styled from 'styled-components';

const FormContainer = styled.div`
  overflow-y: scroll;
  position: relative;
  max-height: 70vh;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const TitleList = styled.h1`
  text-transform: uppercase;
  font-weight: bold;
`;

export {FormContainer, TitleContainer, TitleList};
