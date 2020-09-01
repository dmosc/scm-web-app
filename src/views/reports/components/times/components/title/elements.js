import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  flex-direction: column;
`;

const HeadContainer = styled.div`
  display: flex;
  padding: 5px 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  padding: 5px 0;
  justify-content: flex-end;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

export { TitleContainer, HeadContainer, FiltersContainer, InputContainer };
