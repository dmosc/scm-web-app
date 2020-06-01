import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Button, Form, message, Row, Table, Tooltip, Typography } from 'antd';
import { Card, TableContainer } from './elements';
import Title from './components/title';
import NewBlastProduct from './components/new-blast-product';
import NewBlast from './components/new-blast';
import { GET_BLASTS } from './graphql/queries';

const { Text } = Typography;

const Production = ({ client }) => {
  const [loading, setLoading] = useState(false);
  const [blasts, setBlasts] = useState([]);
  const [isNewBlastModalOpen, toggleNewBlastModal] = useState(false);
  const [isNewBlastProductModalOpen, toggleNewBlastProductModal] = useState(false);

  useEffect(() => {
    const getBlasts = async () => {
      setLoading(true);
      const { data, errors } = await client.query({
        query: GET_BLASTS,
        variables: { filters: {} }
      });

      if (errors) {
        message.error('Ocurrió un error obteniendo las voladuras');
      } else {
        setBlasts(data.blasts);
      }

      setLoading(false);
    };

    getBlasts();
  }, [client]);

  const NewBlastProductForm = Form.create({ name: 'new-blast-product' })(NewBlastProduct);
  const NewBlastForm = Form.create({ name: 'new-blast-product' })(NewBlast);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Productos',
      dataIndex: 'products',
      key: 'products',
      render: () => <Text>Ver</Text>
    },
    {
      title: 'Documentos',
      dataIndex: 'documents',
      key: 'documents',
      render: () => <Text>Ver</Text>
    },
    {
      title: 'Toneladas',
      dataIndex: 'tons',
      key: 'tons'
    },
    {
      title: 'Creado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: ({ username }) => username
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: () => (
        <Row>
          <Tooltip placement="top" title="Eliminar">
            <Button type="danger" icon="delete" size="small"/>
          </Tooltip>
        </Row>
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Table
          loading={loading}
          columns={columns}
          title={() => (
            <Title
              toggleNewBlastModal={toggleNewBlastModal}
              toggleNewBlastProductModal={toggleNewBlastProductModal}
            />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={blasts.map(blast => ({ ...blast, key: shortid.generate() }))}
        />
      </Card>
      {isNewBlastProductModalOpen && (
        <NewBlastProductForm
          isNewBlastProductModalOpen={isNewBlastProductModalOpen}
          toggleNewBlastProductModal={toggleNewBlastProductModal}
        />
      )}
      {isNewBlastModalOpen && (
        <NewBlastForm
          blasts={blasts}
          isNewBlastModalOpen={isNewBlastModalOpen}
          toggleNewBlastModal={toggleNewBlastModal}
          setBlasts={setBlasts}
        />
      )}
    </TableContainer>
  );
};

Production.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Production);