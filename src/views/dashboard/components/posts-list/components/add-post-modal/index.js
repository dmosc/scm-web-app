import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Form, Button, Input, Icon, message, Modal, Upload, Typography } from 'antd';
import { REGISTER_POST } from './graphql/mutations';

const { TextArea } = Input;
const { Text } = Typography;
const { Dragger } = Upload;

const AddPostModal = ({ addPost, client, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    attachments: [],
    gallery: []
  });

  const handleSubmit = async e => {
    setLoading(true);
    e.preventDefault();

    const { title, content } = form;

    const gallery = form.gallery.map(({ originFileObj }) => originFileObj);
    const attachments = form.attachments.map(({ originFileObj }) => originFileObj);

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

  const handlePreview = async file => setPreviewImageUrl(URL.createObjectURL(file.originFileObj));

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
        <Text type="secondary">Añadir imágenes</Text>
        <Upload
          // Upload input relies on this action mock data. It is taken from official antd docs
          // But it can fail in the future. If thats the case, just replace it
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={form.gallery}
          onPreview={handlePreview}
          accept=".png,.jpg,.jpeg"
          onChange={({ fileList }) => setForm({ ...form, gallery: fileList })}
        >
          <div>
            <Icon type="plus" />
            <div className="ant-upload-text">Añadir</div>
          </div>
        </Upload>
        <Text type="secondary">Añadir archivos</Text>
        <Dragger
          name="files"
          multiple
          fileList={form.attachments}
          onChange={({ fileList }) => setForm({ ...form, attachments: fileList })}
          // Upload input relies on this action mock data. It is taken from official antd docs
          // But it can fail in the future. If thats the case, just replace it
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">
            Arrastra aquí cualquier archivo adjunto que desees añadir
          </p>
        </Dragger>
        <Button
          style={{ marginLeft: 'auto', display: 'block', marginTop: 20 }}
          type="primary"
          htmlType="submit"
          icon="plus"
          loading={loading}
        >
          {(loading && 'Espere..') || 'Publicar'}
        </Button>
      </Form>
      <Modal visible={!!previewImageUrl} footer={null} onCancel={() => setPreviewImageUrl('')}>
        <img alt="Preview" style={{ width: '100%' }} src={previewImageUrl} />
      </Modal>
    </Modal>
  );
};

AddPostModal.propTypes = {
  client: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  addPost: PropTypes.func.isRequired
};

export default withApollo(AddPostModal);
