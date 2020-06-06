import React, { Component } from 'react';
import PropTypes from 'prop-types';
import md5 from 'md5';
import { graphql } from '@apollo/react-hoc';
import { Typography, Avatar } from 'antd';
import { PostsListContainer, PostContainer, PostContent } from './elements';
import { GET_POSTS } from './graphql/queries';
import { NEW_POSTS } from './graphql/subscriptions';

const { Paragraph, Text } = Typography;

class PostsList extends Component {
  componentDidMount = () => {
    const {
      data: { subscribeToMore }
    } = this.props;

    if (!this.unsubscribeToPosts) this.unsubscribeToPosts = this.subscribeToPosts(subscribeToMore);
  };

  componentWillUnmount = () => {
    this.unsubscribeToPosts();
  };

  subscribeToPosts = subscribeToMore => {
    return subscribeToMore({
      document: NEW_POSTS,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { posts: oldPosts } = prev;
        const { newPost } = data;
        if (!newPost) return prev;

        for (let i = 0; i < oldPosts.length; i++) if (newPost.id === oldPosts[i].id) return prev;

        const posts = [newPost, ...oldPosts];

        return { posts };
      }
    });
  };

  render() {
    const { data } = this.props;

    const { loading, error, posts } = data;

    if (loading) return <div>Cargando posts recientes...</div>;
    if (error) return <div>¡No se han podido cargar lost posts!</div>;

    return (
      <PostsListContainer>
        {posts.map(post => (
          <PostContainer>
            <Avatar
              style={{
                background: `#${md5(post.username).substring(0, 6)}`,
                verticalAlign: 'middle',
                minWidth: 40,
                minHeight: 40,
                marginRight: 15,
                marginTop: 3
              }}
              size="large"
            >
              {post.username[0].toUpperCase()}
            </Avatar>
            <PostContent>
              <Text style={{ fontSize: '1.2rem' }} strong>
                {post.title}
              </Text>
              <Text style={{ margin: '5px 0' }} type="secondary">
                {post.username}
              </Text>
              <Paragraph ellipsis={{ rows: 2, expandable: true }}>{post.content}</Paragraph>
            </PostContent>
          </PostContainer>
        ))}
      </PostsListContainer>
    );
  }
}

PostsList.propTypes = {
  data: PropTypes.object.isRequired
};

export default graphql(GET_POSTS, { options: () => ({ variables: { filters: {} } }) })(PostsList);
