import React, { useEffect, useState } from 'react';
import {
  DatePicker,
  Divider,
  Form,
  Icon,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Tag,
  Typography
} from 'antd';
import { useDebounce } from 'use-lodash-debounce';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { ProductSelectContainer } from './elements';
import { GET_CLIENTS, GET_GROUPS, GET_ROCKS } from './graphql/queries';
import { EDIT_PROMOTION, REGISTER_PROMOTION } from './graphql/mutations';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const PromotionModal = ({
  client,
  form,
  currentPromotion,
  visible,
  togglePromotionModal,
  setCurrentPromotion,
  updateFather
}) => {
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingClientsGroups, setLoadingClientsGroups] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [clientsGroups, setClientsGroups] = useState([]);
  const [rocks, setRocks] = useState([]);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const getRocks = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });

      setRocks(rocksToSet);
    };

    getRocks();
  }, [client]);

  useEffect(() => {
    const getClients = async () => {
      if (!debouncedSearch) {
        setClients([]);
        setLoadingClients(false);
        return;
      }

      const {
        data: { clients: clientsToSet }
      } = await client.query({
        query: GET_CLIENTS,
        variables: {
          filters: { limit: 10, search: debouncedSearch }
        }
      });

      setLoadingClients(false);
      setClients(clientsToSet);
    };

    getClients();
  }, [client, debouncedSearch]);

  useEffect(() => {
    const getGroups = async () => {
      if (!debouncedSearch) {
        setClientsGroups([]);
        setLoadingClientsGroups(false);
        return;
      }

      const {
        data: { clientsGroups: clientsGroupsToSet }
      } = await client.query({
        query: GET_GROUPS,
        variables: {
          filters: { limit: 10, search: debouncedSearch }
        }
      });

      setLoadingClientsGroups(false);
      setClientsGroups(clientsGroupsToSet);
    };

    getGroups();
  }, [client, debouncedSearch]);

  const onSearch = searchToSet => {
    setLoadingClients(!!searchToSet);
    setSearch(searchToSet);
  };

  const handleSubmit = async e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      const promotionToSet = { ...args };

      if (!err) {
        for (const [key, value] of Object.entries(promotionToSet)) {
          if (value === null || value === undefined) delete promotionToSet[key];
        }

        if (currentPromotion) {
          promotionToSet.id = currentPromotion.id;

          delete promotionToSet.product;
          delete promotionToSet.price;
        } else {
          promotionToSet.product = {
            rock: promotionToSet.product,
            price: promotionToSet.price
          };

          delete promotionToSet.price;
        }

        if (promotionToSet.dates) {
          const [start, end] = promotionToSet.dates;

          promotionToSet.start = start?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          promotionToSet.end = end?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

          delete promotionToSet.dates;
        }

        if (promotionToSet.credit) promotionToSet.credit = promotionToSet.credit === 'CREDIT';
        if (promotionToSet.bill) promotionToSet.bill = promotionToSet.bill === 'BILL';
        if (promotionToSet.clients)
          promotionToSet.clients = promotionToSet.clients.map(({ key }) => key.split(':')[0]);
        if (promotionToSet.groups)
          promotionToSet.groups = promotionToSet.groups.map(({ key }) => key.split(':')[0]);

        const { data } = await client.mutate({
          mutation: currentPromotion ? EDIT_PROMOTION : REGISTER_PROMOTION,
          variables: { promotion: promotionToSet }
        });

        const promotion = data.promotion ? data.promotion : data.promotionEdit;

        message.success(
          `Promoción ${promotion.name} ha sido ${
            data.promotion ? 'registrada' : 'editada'
          } exitosamente!`
        );

        form.resetFields();
        togglePromotionModal(false);
        updateFather();
      } else {
        message.error('Ha habido un error creando la promocion!');
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title={currentPromotion ? `Editando promoción: ${currentPromotion.name}` : 'Crear promoción'}
      okText="Guardar"
      cancelText="Cancelar"
      visible={visible}
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={() => {
        setCurrentPromotion();
        togglePromotionModal(false);
      }}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('name', {
            initialValue: currentPromotion ? currentPromotion.name : undefined,
            rules: [
              {
                required: true,
                message: 'Un nombre para la promocion es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="scissor" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre de la promoción"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Seleccione el producto participante
          </Divider>
          <ProductSelectContainer>
            {form.getFieldDecorator('product', {
              initialValue: currentPromotion ? currentPromotion.product.rock.id : undefined,
              rules: [
                {
                  required: true,
                  message: 'Un product es requerido!'
                }
              ]
            })(
              <Select
                allowClear
                style={{ flexBasis: '70%', width: '100%', marginRight: 5 }}
                placeholder="Piedras disponibles"
              >
                {rocks.map(({ id, name, price, floorPrice }) => (
                  <Option key={id} value={id}>
                    <Text style={{ marginRight: 20 }}>{name}</Text>
                    <Tag color="blue" style={{ marginRight: 20 }}>{`B: ${price}MXN`}</Tag>
                    <Tag color="orange">{`P: ${floorPrice}MXN`}</Tag>
                  </Option>
                ))}
              </Select>
            )}
            {form.getFieldDecorator('price', {
              initialValue: currentPromotion ? currentPromotion.product.price : undefined,
              rules: [
                {
                  required: true,
                  message: 'Un precio de descuento es requerido!'
                }
              ]
            })(
              <InputNumber
                required
                style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
                placeholder="MXN / Ton"
                min={0}
                step={0.01}
              />
            )}
          </ProductSelectContainer>
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Rango de fechas y/o límite de toneladas
          </Divider>
          {form.getFieldDecorator('dates', {
            initialValue:
              currentPromotion && currentPromotion.start && currentPromotion.end
                ? [moment(currentPromotion.start), moment(currentPromotion.end)]
                : undefined
          })(
            <RangePicker
              style={{ width: '58%', marginRight: 15 }}
              ranges={{
                'Una semana': [
                  moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                  moment()
                    ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .add(1, 'week')
                ],
                'Dos semanas': [
                  moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                  moment()
                    ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .add(2, 'week')
                ],
                'Un mes': [
                  moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                  moment()
                    ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .add(1, 'month')
                ],
                'Tres meses': [
                  moment()?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                  moment()
                    ?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .add(3, 'month')
                ]
              }}
              // onChange={dates => handleDateFilterChange(dates)}
            />
          )}
          {form.getFieldDecorator('limit', {
            initialValue: currentPromotion ? currentPromotion.limit : undefined
          })(
            <InputNumber
              style={{ width: '38%' }}
              placeholder="Límite de toneladas"
              min={0}
              step={0.01}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Tipo de boletas y/o pagos
          </Divider>
          {form.getFieldDecorator('bill', {
            initialValue:
              !currentPromotion || currentPromotion?.bill === null
                ? undefined
                : currentPromotion?.bill
                ? 'BILL'
                : 'REMISSION'
          })(
            <Select
              allowClear
              style={{ width: '48%', marginRight: 15 }}
              placeholder="Tipo de boletas"
            >
              <Option value="BILL">Facturados</Option>
              <Option value="REMISSION">Remisión</Option>
            </Select>
          )}
          {form.getFieldDecorator('credit', {
            initialValue:
              !currentPromotion || currentPromotion?.credit === null
                ? undefined
                : currentPromotion?.credit
                ? 'CREDIT'
                : 'CASH'
          })(
            <Select allowClear style={{ width: '48%' }} placeholder="Tipo de pago">
              <Option value="CASH">Contado</Option>
              <Option value="CREDIT">Crédito</Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Seleccione los grupos participantes
          </Divider>
          {form.getFieldDecorator('groups', {
            initialValue: currentPromotion
              ? currentPromotion.groups.map(({ id, name }) => ({ key: id, label: name }))
              : undefined
          })(
            <Select
              showSearch
              allowClear
              labelInValue
              mode="multiple"
              style={{ width: '100%', overflowY: 'scroll' }}
              placeholder="Seleccionar un grupo de clientes"
              onSearch={onSearch}
              loading={loadingClientsGroups}
            >
              {clientsGroups.map(({ id, name }) => (
                <Option key={id} value={`${id}:${name}`}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Seleccione los clientes participantes
          </Divider>
          {form.getFieldDecorator('clients', {
            initialValue: currentPromotion
              ? currentPromotion.clients.map(({ id, businessName }) => ({
                  key: id,
                  label: businessName
                }))
              : undefined
          })(
            <Select
              showSearch
              allowClear
              labelInValue
              mode="multiple"
              style={{ width: '100%', overflowY: 'scroll' }}
              placeholder="Todos por defecto"
              onSearch={onSearch}
              loading={loadingClients}
            >
              {clients.map(({ id, businessName }) => (
                <Option key={id} value={`${id}:${businessName}`}>
                  {businessName}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

PromotionModal.propTypes = {
  currentPromotion: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  togglePromotionModal: PropTypes.func.isRequired,
  setCurrentPromotion: PropTypes.func.isRequired,
  updateFather: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired
};

export default withApollo(PromotionModal);
