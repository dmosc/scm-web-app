import styled from 'styled-components';

const PreviewImageContainer = styled.div`
  height: 36vh;
  width: 48vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed lightGrey;
  border-radius: 5px;
  margin: 0px 5px;
`;

const ImageContainer = styled.img`
  height: 36vh;
  width: 48vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin: 0px 5px;
`;

export { PreviewImageContainer, ImageContainer };
