import styled from 'styled-components';

const FormContainer = styled.div`
  overflow-y: scroll;
  position: relative;
  height: 65vh;
`;

const PreviewImageContainer = styled.div`
  height: 15vw;
  width: 20vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed lightGrey;
  border-radius: 5px;
  margin-bottom: 5px;
`;

const ImageContainer = styled.img`
  height: 15vw;
  width: 20vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin-bottom: 5px;
`;

export {FormContainer, PreviewImageContainer, ImageContainer};