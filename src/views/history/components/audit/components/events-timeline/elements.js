import styled from 'styled-components';

const Container = styled.div`
  padding: 0 20px;
`;

const ResponsableBlock = styled.div`
  display: flex;
  margin: 0 10px;
`;

const ResponsableCol = styled.div`
  display: flex;
  flex-direction: column;

  .ant-typography {
    margin: 0;
  }

  .ant-tag.ant-tag-blue {
    width: fit-content;
  }
`;

export { Container, ResponsableBlock, ResponsableCol };
