import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from 'components/providers/withAuth';
import shortid from 'shortid';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import { Button, Form, Modal, notification, Row, Table, Tag, Tooltip } from 'antd';
import ProductEditForm from './components/product-edit-form';
import NewProductForm from './components/new-product-form';
import Title from './components/title';
import { Card, TableContainer } from './elements';
import { GET_ROCKS } from './graphql/queries';
import { DELETE_PRODUCT } from './graphql/mutations';

const { confirm } = Modal;

const Products = ({ client }) => {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({ search: '' });
  const [currentProduct, setCurrentProduct] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [isEditModalOpen, toggleEditModal] = useState(false);
  const [isNewProductFormOpen, toggleNewProductForm] = useState(false);
  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    const getRocks = async () => {
      setLoadingProducts(true);
      const {
        data: { rocks: productsToSet }
      } = await client.query({ query: GET_ROCKS, variables: { filters: debouncedFilters } });
      setProducts(productsToSet);
      setLoadingProducts(false);
    };

    getRocks();
  }, [debouncedFilters, client]);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

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

  const deleteProduct = productToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar este producto?',
      content: 'Una vez eliminado, ya no aparecerá en la lista de productos disponibles',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_PRODUCT,
          variables: { id: productToDelete.id }
        });

        setProducts(products.filter(({ id }) => id !== productToDelete.id));

        notification.open({
          message: `El producto ${productToDelete.name} ha sido removido`
        });
      },
      onCancel: () => {}
    });
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
      title: 'Precio suelo',
      dataIndex: 'floorPrice',
      key: 'floorPrice',
      render: floorPrice => <Tag color="orange">${floorPrice} MXN</Tag>
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: color => <Tag color={color}>{color}</Tag>
    }
  ];

  if (isAdmin) {
    columns.push({
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Editar">
            <Button
              style={{ marginRight: 5 }}
              onClick={() => handleToggleEditModal(row)}
              type="default"
              icon="edit"
              size="small"
            />
          </Tooltip>
          <Tooltip placement="top" title="Eliminar">
            <Button
              style={{ marginRight: 5 }}
              onClick={() => deleteProduct(row)}
              type="danger"
              icon="delete"
              size="small"
            />
          </Tooltip>
        </Row>
      )
    });
  }

  const NewProductRegisterForm = Form.create({ name: 'new-product-form' })(NewProductForm);

  return (
    <TableContainer>
      <Card bordered={false}>
        <Table
          loading={loadingProducts}
          columns={columns}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewProductForm={toggleNewProductForm}
            />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={products.map(productMapped => ({
            ...productMapped,
            key: shortid.generate()
          }))}
        />
      </Card>
      <ProductEditForm
        visible={isEditModalOpen}
        currentProduct={currentProduct}
        toggleEditModal={toggleEditModal}
        updateProducts={updateProducts}
      />
      <NewProductRegisterForm
        visible={isNewProductFormOpen}
        toggleNewProductForm={toggleNewProductForm}
        products={products}
        setProducts={setProducts}
      />
    </TableContainer>
  );
};

Products.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Products);
