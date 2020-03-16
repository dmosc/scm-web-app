import styled from 'styled-components';

const Link = styled.a`
  color: #1890ff;

  :hover {
    color: #1890ff;
  }
`;

const Credit = styled.span`
  margin: 0;
  padding: 0;
  font-weight: bold;
  color: ${props => (props.credit > 0 ? '#52c41a' : '#f5222d')};
`;

const Actions = styled.div`
  display: flex;
  padding-top: 10px;
  border-top: 1px solid #ecedef;

  button {
    margin-right: 5px;
  }
`;

export { Link, Credit, Actions };
