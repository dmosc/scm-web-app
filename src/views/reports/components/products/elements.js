import styled from 'styled-components';

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-gap: 20px;
  margin: 40px 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

export { ChartsContainer, FiltersContainer, InputContainer };
