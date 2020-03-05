import styled from 'styled-components';
import { Input, List } from 'antd';

const ProductList = styled(List)`
  ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px;
  }
`;

const FormContainer = styled.div`
  overflow-y: scroll;
  position: relative;
  height: 73vh;
`;

const PreviewImageContainer = styled.div`
  height: 15vw;
  width: 20vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed lightGrey;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ImageContainer = styled.img`
  height: 15vw;
  width: 20vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ProductContainer = styled.div`
  width: 100%;
  height: fit-content;
  text-align: center;
  padding: 20px 10px;
  border-radius: 5px;
  color: #ffffff;
  font-weight: 600;
  background-color: ${props => props.color ?? 'none'};

  -webkit-transition: background-color 100ms linear;
  -ms-transition: background-color 100ms linear;
  transition: background-color 100ms linear;

  :hover {
    box-shadow: 0 0 1rem 0 rgba(136, 152, 170, 0.2);
    cursor: pointer;
  }
`;

const PlatesInput = styled(Input)`
  text-transform: uppercase;
`;

export {
  FormContainer,
  PreviewImageContainer,
  ImageContainer,
  ProductContainer,
  PlatesInput,
  ProductList
};
