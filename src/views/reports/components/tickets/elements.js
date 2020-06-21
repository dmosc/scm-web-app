import styled from 'styled-components';
import { Col as DefaultCol } from 'antd';

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

  .turnFilter {
    min-width: 600px;
  }

  .limitedSelect {
    width: 120px;
  }

  ${props => props.theme.media.lg`
    flex-direction: column;

    .turnFilter {
      min-width: initial
    }

    .limitedSelect {
      width: initial;
    }

    .ant-select {
      margin-bottom: 10px;
    }
  `}
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

const Col = styled(DefaultCol)`
  ${props => props.theme.media.xl`
    text-align: center;
    margin: 10px 0;
  `}
`;

export { ChartsContainer, FiltersContainer, InputContainer, Col };
