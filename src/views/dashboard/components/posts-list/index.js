import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import md5 from 'md5';
import moment from 'moment';
import shortid from 'shortid';
import { Typography, Avatar, Skeleton, Empty } from 'antd';
import { PostsListContainer, PostContainer, PostContent } from './elements';
import { GET_POSTS } from './graphql/queries';
import AddPostModal from './components/add-post-modal';

const { Paragraph, Text } = Typography;

const PostsList = ({ client, toggleAddPostModal, isAddPostModalOpen }) => {
  const [posts, setPosts] = useState(
    new Array(4).fill({
      author: { username: '', firstName: '', lastName: '' },
      title: '',
      content: ''
    })
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      const {
        data: { posts: postsToSet }
      } = await client.query({
        query: GET_POSTS,
        variables: {
          filters: {
            pageSize: 20
          }
        }
      });

      setPosts(postsToSet);
      setLoading(false);
    };

    getPosts();
  }, [client, loading]);

  const addPost = newPost => {
    setPosts([newPost, ...posts]);
  };

  return (
    <PostsListContainer>
      {posts.map(post => (
        <Skeleton key={shortid.generate()} loading={loading} avatar active>
          <PostContainer>
            <Avatar
              style={{
                background: `#${md5(post.author.username).substring(0, 6)}`,
                verticalAlign: 'middle',
                minWidth: 40,
                minHeight: 40,
                marginRight: 15,
                marginTop: 3
              }}
              size="large"
            >
              {post.author.firstName[0]?.toUpperCase()} {post.author.lastName[0]?.toUpperCase()}
            </Avatar>
            <PostContent>
              <Text strong>{post.title}</Text>
              <Text style={{ fontSize: '0.6rem', marginBottom: 10 }} type="secondary">
                {post.author.firstName} {post.author.lastName} - {moment(post.createdAt).fromNow()}
              </Text>
              <Paragraph fontSize="0.85rem" ellipsis={{ rows: 2, expandable: true }}>
                {post.content}
              </Paragraph>
            </PostContent>
          </PostContainer>
        </Skeleton>
      ))}
      {posts.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {isAddPostModalOpen && (
        <AddPostModal addPost={addPost} onClose={() => toggleAddPostModal(false)} />
      )}
    </PostsListContainer>
  );
};

PostsList.propTypes = {
  client: PropTypes.object.isRequired,
  toggleAddPostModal: PropTypes.func.isRequired,
  isAddPostModalOpen: PropTypes.bool.isRequired
};

export default withApollo(PostsList);
