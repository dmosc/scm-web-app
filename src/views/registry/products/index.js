import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { withApollo } from 'react-apollo';
import { Form, Tag, Button, Table } from 'antd';
import ProductForm from './components/product-form';
import { GET_ROCKS } from './graphql/queries';
import { TableContainer, Card } from './elements';

const Products = ({ client }) => {
  const [currentProduct, setCurrentProduct] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [isEditModalOpen, toggleEditModal] = useState(false);

  const ProductEditForm = Form.create({ name: 'product' })(ProductForm);

  useEffect(() => {
    const getRocks = async () => {
      setLoadingProducts(true);
      const {
        data: { rocks: productsToSet }
      } = await client.query({ query: GET_ROCKS, variables: { filters: {} } });
      setProducts(productsToSet);
      setLoadingProducts(false);
    };

    getRocks();
  }, [client]);

  const handleToggleEditModal = productToEdit => {
    setCurrentProduct(productToEdit);
    toggleEditModal(true);
  };

  const updateProducts = productUpdated => {
    const productsToSet = products.map(product => {
      if (product.id === productUpdated.id) {
        return productUpdated;
      }
      return product;
    });
    setProducts(productsToSet);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: price => <Tag color="blue">${price} MXN</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: row => (
        <Button
          onClick={() => handleToggleEditModal(row)}
          type="default"
          icon="edit"
          size="small"
        />
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <ProductEditForm
          visible={isEditModalOpen}
          currentProduct={currentProduct}
          toggleEditModal={toggleEditModal}
          updateProducts={updateProducts}
        />
        <Table
          loading={loadingProducts}
          columns={columns}
          size="small"
          scroll={{ x: true, y: true }}
          pagination={{ defaultPageSize: 20 }}
          dataSource={products.map(productMapped => ({
            ...productMapped,
            key: shortid.generate()
          }))}
        />
      </Card>
    </TableContainer>
  );
};

Products.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Products);
