import styled from 'styled-components';

const InputColor = styled.input`
  width: 50%;
  height: 35px;
  padding: 5px;
  background-color: none;
  border: 0.5px solid lightGrey;
  border-radius: 5px;
  outline: none;

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 3rem 0 rgba(136, 152, 170, 0.2);
  }
`;

export { InputColor };
