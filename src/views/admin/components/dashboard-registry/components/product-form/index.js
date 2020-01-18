import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {Form, Select, InputNumber, List, Button, notification} from 'antd';
import ListContainer from "components/common/list";
import {GET_ROCKS} from './graphql/queries';
import {EDIT_ROCK} from './graphql/mutations';

const {Option} = Select;

class ProductForm extends Component {
  state = {
    loading: false,
    loadingProducts: false,
    currentProduct: null,
    products: [],
  };

  componentDidMount = async () => {
    const {client} = this.props;

    this.setState({loadingProducts: true});

    const {
      data: {rocks: products},
    } = await client.query({query: GET_ROCKS, variables: {filters: {}}});

    this.setState({loadingProducts: false, products});
  };

  setCurrentProduct = currentProduct => this.setState({currentProduct});

  clearCurrentProduct = () => this.setState({currentProduct: null});

  handleSubmit = e => {
    const {form, client} = this.props;
    const {
      currentProduct: {id},
      products: oldProducts,
    } = this.state;

    this.setState({loading: true});
    e.preventDefault();

    form.validateFields(async (err, {name, price}) => {
      if (!err) {
        try {
          const {
            data: {rockEdit: newProduct},
          } = await client.mutate({
            mutation: EDIT_ROCK,
            variables: {
              rock: {id, name, price},
            },
          });

          const products = [...oldProducts];
          products.forEach((product, i) =>
            product.id === newProduct.id
              ? (products[i] = {...newProduct})
              : null
          );
          this.setState({loading: false, currentProduct: null, products});

          notification.open({
            message: `Product ${newProduct.name} ha sido actualizado exitosamente!`,
          });

          form.resetFields();
        } catch (e) {
          console.log(e);
          e['graphQLErrors'].map(({message}) =>
            notification.open({
              message,
            })
          );
          this.setState({loading: false});
        }
      } else {
        this.setState({loading: false});
      }
    });
  };

  render() {
    const {form} = this.props;
    const {loading, loadingProducts, currentProduct, products} = this.state;

    return (
      <React.Fragment>
        <Form onSubmit={this.handleSubmit} layout="inline">
          <Form.Item>
            {form.getFieldDecorator('name')(
              <Select style={{minWidth: 200}} showSearch allowClear placeholder="Tipo de producto">
                {products.map(product => (
                  <Option
                    style={{width: '100%'}}
                    key={product.id}
                    value={product.name}
                    onClick={() => this.setCurrentProduct(product)}
                  >
                    {`${product.name}`}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('price', {
              initialValue: currentProduct?.price,
            })(
              <InputNumber
                autoFocus
                style={{width: '100%'}}
                placeholder={currentProduct?.price}
                min={0}
                step={0.1}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon="save"
              loading={loading}
            >
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
        <ListContainer height="40vh">
          <List
            loading={loadingProducts}
            itemLayout="horizontal"
            dataSource={products}
            size="small"
            renderItem={product => (
              <List.Item>
                <List.Item.Meta
                  title={`${product.name}`}
                  description={`${product.price}`}
                />
              </List.Item>
            )}
          />
        </ListContainer>
      </React.Fragment>
    );
  }
}

export default withApollo(ProductForm);
