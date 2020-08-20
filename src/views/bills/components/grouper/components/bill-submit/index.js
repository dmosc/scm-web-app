import React, { useEffect, useState } from 'react';
import { format } from 'utils/functions';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  Form,
  Icon,
  InputNumber,
  List,
  message,
  Select,
  Tag,
  Typography
} from 'antd';
import ListContainer from 'components/common/list';
import { GET_BILL_SUMMARY, GET_CLIENT } from './graphql/queries';
import { REGISTER_BILL } from './graphql/mutations';

const { Title } = Typography;
const { Option } = Select;

const BillSubmit = ({
  client,
  form,
  type,
  clients,
  currentClient,
  targetTickets,
  setCurrentClient,
  setClients
}) => {
  const [loading, setLoading] = useState(false);
  const [turnToBill, setTurnToBill] = useState(false);
  const [billSummary, setBillSummary] = useState({
    products: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    if (currentClient) {
      const getBillSummary = async () => {
        const {
          data: { ticketsToBillSummary }
        } = await client.query({
          query: GET_BILL_SUMMARY,
          variables: { tickets: targetTickets, turnToBill }
        });

        setBillSummary(ticketsToBillSummary);
      };

      const getClientData = async () => {
        const {
          data: { client: clientToSet }
        } = await client.query({
          query: GET_CLIENT,
          variables: { id: currentClient }
        });

        setClientData(clientToSet);
      };

      getBillSummary();
      getClientData();
    } else {
      setBillSummary({ products: [], subtotal: 0, tax: 0, total: 0 });
      setClientData(null);
    }
  }, [client, currentClient, targetTickets, setBillSummary, turnToBill]);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { store, creditDays }) => {
      if (!err) {
        try {
          const {
            data: { bill },
            errors
          } = await client.mutate({
            mutation: REGISTER_BILL,
            variables: {
              bill: {
                client: currentClient,
                store,
                tickets: targetTickets,
                creditDays,
                bill: type === 'BILL',
                turnToBill
              }
            }
          });

          if (errors) {
            errors.forEach(error => {
              message.error(error.message);
            });
            setLoading(false);
            return;
          }

          message.success(`Se ha creado exitosamente la factura ${bill.folio}`);
          form.resetFields();

          const clientsToSet = [...clients];

          for (let i = 0; i < clients.length; i++) {
            if (clients[i].id === bill.client.id) {
              clientsToSet[i] = { ...clients[i], count: clients[i].count - targetTickets.length };
              break;
            }
          }

          setClients(clientsToSet);
          setBillSummary({ products: [], subtotal: 0, tax: 0, total: 0 });
          setClientData(null);
          setCurrentClient(null);
        } catch (error) {
          message.error('Ha habido un error durante la creación de la factura');
        }
      }
    });

    setLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        maxHeight: '5vw',
        justifyContent: 'space-between',
        padding: '5px 20px'
      }}
    >
      <div>
        <Title level={4}>{`Subtotal $${billSummary.subtotal}`}</Title>
        <Title level={4}>{`Impuestos $${billSummary.tax}`}</Title>
        <Title level={4}>{`Total $${billSummary.total}`}</Title>
      </div>
      <ListContainer title={`Lista de productos (${billSummary.products.length})`} height="20vh">
        <List
          loading={false}
          bordered={false}
          dataSource={billSummary.products}
          size="small"
          renderItem={({ product, price, weight, total }) => (
            <>
              <List.Item>
                <Tag>{product.name}</Tag>
                <Tag>{`${format.number(weight)} tons`}</Tag>
                <Tag>{`${format.currency(price)} p/t`}</Tag>
                <Tag>{format.currency(total)}</Tag>
              </List.Item>
            </>
          )}
        />
      </ListContainer>
      <Form onSubmit={handleSubmit}>
        <Form.Item style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('store')(
            <Select
              id="skip"
              style={{ width: 250 }}
              disabled={!clientData || clientData?.stores.length === 0}
              placeholder={clientData?.stores.length > 0 ? 'Seleccionar sucursal' : 'Matriz'}
              allowClear
            >
              {clientData?.stores?.map(store => (
                <Option key={store.id} value={store.id}>
                  {store.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Días de crédito" style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('creditDays', {
            initialValue: clientData?.defaultCreditDays || 0,
            rules: [
              {
                required: true,
                message: 'Los días de crédito son requeridos!'
              }
            ]
          })(
            <InputNumber
              min={0}
              prefix={<Icon type="credit-card" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Checkbox
            defaultChecked={false}
            disabled={type === 'BILL'}
            onChange={({ target: { checked } }) => setTurnToBill(checked)}
          >
            Aplicar I.V.A.
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            disabled={!currentClient || billSummary.total === 0}
            type="primary"
            htmlType="submit"
            icon="plus"
            loading={loading}
          >
            {(loading && 'Espere...') || 'Generar factura'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

BillSubmit.defaultProps = {
  currentClient: null
};

BillSubmit.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  clients: PropTypes.array.isRequired,
  currentClient: PropTypes.string,
  targetTickets: PropTypes.array.isRequired,
  setCurrentClient: PropTypes.func.isRequired,
  setClients: PropTypes.func.isRequired
};

export default withApollo(BillSubmit);
