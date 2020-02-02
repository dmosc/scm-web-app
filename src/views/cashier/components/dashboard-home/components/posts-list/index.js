import React, {Component} from 'react';
import {graphql} from '@apollo/react-hoc';
import {Typography} from 'antd';
import {PostsListContainer} from './elements';
import {GET_POSTS} from './graphql/queries';
import {NEW_POSTS} from './graphql/subscriptions';

const {Title, Paragraph, Text} = Typography;

class PostsList extends Component {
  componentDidMount = () => {
    const { data: { subscribeToMore }} = this.props;

    if(!this.unsubscribeToPosts) this.unsubscribeToPosts = this.subscribeToPosts(subscribeToMore);
  };

  componentWillUnmount = () => {
    this.unsubscribeToPosts();
  };

  subscribeToPosts = subscribeToMore => {
    return subscribeToMore({
      document: NEW_POSTS,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {posts: oldPosts} = prev;
        const {newPost} = data;
        if (!newPost) return prev;

        for (let i = 0; i < oldPosts.length; i++)
          if (newPost.id === oldPosts[i].id) return prev;

        const posts = [newPost, ...oldPosts];

        return {posts};
      },
    });
  };

  render() {
    const {data} = this.props;

    const {loading, error, posts} = data;

    if (loading) return <div>Cargando posts recientes...</div>;
    if (error) return <div>¡No se han podido cargar lost posts!</div>;

    return (
        <PostsListContainer>
          {posts.map(post => (
              <div
                  key={post.id}
                  style={{
                    borderBottom: '1px solid lightGrey',
                    padding: 5,
                    margin: 5
                  }}
              >
                <Title level={4}>{post.title}</Title>
                <Paragraph ellipsis={{rows: 2, expandable: true}}>
                  {post.content}
                </Paragraph>
                <Text mark>{post.username}</Text>
              </div>
          ))}
        </PostsListContainer>
    );
  }
}

export default graphql(GET_POSTS, {options: () => ({variables: {filters: {}}})})(PostsList);
