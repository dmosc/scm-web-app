import React from 'react';
import Container from 'components/common/container';
import PostsList from './components/posts-list';

const Dashboard = () => (
  <>
    <Container title="Posts recientes" width="30%">
      <PostsList />
    </Container>
  </>
);

export default Dashboard;
