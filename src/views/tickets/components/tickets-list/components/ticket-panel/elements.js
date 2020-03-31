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

const Table = styled.table`
  width: 100%;
  margin: 10px;
  font-size: 12px;

  .hide {
    visibility: hidden;
  }

  p {
    margin: 0;
  }

  tbody > tr > td > b {
    font-size: 8px;
  }
`;

export { Link, Credit, Actions, Table };
