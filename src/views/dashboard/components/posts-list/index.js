import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import md5 from 'md5';
import moment from 'moment';
import shortid from 'shortid';
import { useAuth } from 'components/providers/withAuth/index';
import { Typography, Avatar, Skeleton, Empty, Button, Popconfirm, message } from 'antd';
import {
  PostsListContainer,
  PostContainer,
  PostContent,
  ImagesContainer,
  FilesContainer
} from './elements';
import { GET_POSTS } from './graphql/queries';
import { DELETE_POST } from './graphql/mutations';
import AddPostModal from './components/add-post-modal';
import ImagePreview from './components/image-preview';
import FilePreview from './components/file-preview';

const { Paragraph, Text } = Typography;

const PostsList = ({ client, toggleAddPostModal, isAddPostModalOpen }) => {
  const { user, isAdmin } = useAuth();
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

  const deletePost = async (id, idx) => {
    const { errors } = await client.mutate({
      mutation: DELETE_POST,
      variables: {
        id
      }
    });

    if (errors) {
      message.error(errors[0].message);
    } else {
      message.success('El post ha sido eliminado');
      const newPosts = [...posts];
      newPosts.splice(idx, 1);
      setPosts(newPosts);
    }
  };

  return (
    <PostsListContainer>
      {posts.map((post, index) => (
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
              {post.author.firstName[0]?.toUpperCase()}
              {post.author.lastName[0]?.toUpperCase()}
            </Avatar>
            <PostContent>
              <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Text strong>{post.title}</Text>
                  <Text style={{ fontSize: '0.6rem', marginBottom: 10 }} type="secondary">
                    {post.author.firstName} {post.author.lastName} -{' '}
                    {moment(post.createdAt).fromNow()}
                  </Text>
                </div>
                {(isAdmin || user.id === post.author.id) && (
                  <Popconfirm
                    title="¿Seguro que quieres eliminar este post?"
                    okText="Sí"
                    cancelText="No"
                    onConfirm={() => deletePost(post.id, index)}
                  >
                    <Button
                      style={{ fontSize: '0.8rem' }}
                      type="danger"
                      ghost
                      shape="circle"
                      icon="delete"
                    />
                  </Popconfirm>
                )}
              </div>
              <Paragraph fontSize="0.85rem">{post.content}</Paragraph>
              {post.gallery?.length > 0 && (
                <ImagesContainer>
                  {post.gallery.map(image => (
                    <ImagePreview key={image} src={image} />
                  ))}
                </ImagesContainer>
              )}
              {post.attachments?.length > 0 && (
                <FilesContainer>
                  {post.attachments.map(file => (
                    <FilePreview key={file} src={file} />
                  ))}
                </FilesContainer>
              )}
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
