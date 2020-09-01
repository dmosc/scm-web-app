import styled from 'styled-components';

const Actions = styled.div`
  display: flex;
  padding-top: 10px;
  border-top: 1px solid #ecedef;

  ${props => props.theme.media.md`
    flex-direction: column;
    button {
      margin: 5px 0;
    }
  `}

  button {
    margin-right: 5px;
  }
`;

export { Actions };
