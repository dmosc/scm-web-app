import styled from 'styled-components';

const FormContainer = styled.div`
  position: relative;
  max-height: 50vh;

  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

export default FormContainer;
