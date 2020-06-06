import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Typography } from 'antd';

const { Text } = Typography;

const knownFilesIcon = extension => {
  switch (extension.toLowerCase()) {
    case 'xls':
      return 'file-excel';
    case 'xlsx':
      return 'file-excel';
    case 'xlsm':
      return 'file-excel';
    case 'xlsb':
      return 'file-excel';
    case 'xltx':
      return 'file-excel';
    case 'xltm':
      return 'file-excel';
    case 'xlt':
      return 'file-excel';
    case 'ppt':
      return 'file-ppt';
    case 'pptx':
      return 'file-ppt';
    case 'pptm':
      return 'file-ppt';
    case 'potx':
      return 'file-ppt';
    case 'pot':
      return 'file-ppt';
    case 'ppsx':
      return 'file-ppt';
    case 'ppsm':
      return 'file-ppt';
    case 'pps':
      return 'file-ppt';
    case 'ppam':
      return 'file-ppt';
    case 'potm':
      return 'file-ppt';
    case 'docx':
      return 'file-word';
    case 'docm':
      return 'file-word';
    case 'doc':
      return 'file-word';
    case 'dot':
      return 'file-word';
    case 'dotm':
      return 'file-word';
    case 'dotx':
      return 'file-word';
    case 'pdf':
      return 'file-pdf';
    case 'zip':
      return 'file-zip';
    case 'jpg':
      return 'file-image';
    case 'jpeg':
      return 'file-image';
    case 'gif':
      return 'file-image';
    case 'tiff':
      return 'file-image';
    case 'png':
      return 'file-excel';
    default:
      return 'file';
  }
};

const FilePreview = ({ src }) => {
  const filename = src.slice(src.lastIndexOf('/') + 1);
  const extension = src.slice(src.lastIndexOf('.') + 1);

  const download = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <>
      <Card
        onClick={download}
        style={{
          marginRight: 5,
          marginBottom: 5,
          cursor: 'pointer',
          borderRadius: 9999,
          fontSize: '0.7rem'
        }}
        bodyStyle={{ padding: '5px 10px', display: 'flex', alignItems: 'center' }}
      >
        <Icon type={knownFilesIcon(extension)} style={{ fontSize: '1.2rem', marginRight: 10 }} />
        <Text type="secondary">{filename}</Text>
      </Card>
    </>
  );
};

FilePreview.propTypes = {
  src: PropTypes.string.isRequired
};

export default FilePreview;
