import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Form, Button, Input, Icon, message, Modal } from 'antd';
import { REGISTER_POST } from './graphql/mutations';

const { TextArea } = Input;

const AddPostModal = ({ addPost, client, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    attachments: [],
    gallery: []
  });

  const handleSubmit = async e => {
    setLoading(true);
    e.preventDefault();

    const { title, content, attachments, gallery } = form;

    try {
      const {
        data: { post }
      } = await client.mutate({
        mutation: REGISTER_POST,
        variables: { post: { title, content, attachments, gallery } }
      });

      if (post) {
        message.success(`Post ${post.title} ha sido publicado exitosamente`);
        addPost(post);
        onClose();
      } else {
        message.error('Ha habido un error realizando la publicación');
      }
    } catch {
      message.error('No se puede realizar la publicación');
    }

    setLoading(false);
  };

  return (
    <Modal title="Añade un post" visible footer={null} onCancel={onClose}>
      <Form onSubmit={handleSubmit}>
        <Input
          prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Título del post"
          required
          style={{ marginBottom: 20 }}
          onChange={({ target: { value } }) => setForm({ ...form, title: value })}
        />
        <TextArea
          allowClear
          required
          onChange={({ target: { value } }) => setForm({ ...form, content: value })}
          placeholder="Contenido..."
          style={{ marginBottom: 20 }}
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
        <Button
          style={{ marginLeft: 'auto', display: 'block' }}
          type="primary"
          htmlType="submit"
          icon="plus"
          loading={loading}
        >
          {(loading && 'Espere..') || 'Publicar'}
        </Button>
      </Form>
    </Modal>
  );
};

AddPostModal.propTypes = {
  client: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  addPost: PropTypes.func.isRequired
};

export default withApollo(AddPostModal);
