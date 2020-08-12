import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ioClient from 'socket.io-client';
import { withApollo } from 'react-apollo';
import { useAuth } from 'components/providers/withAuth';
import { isUnlimited } from 'utils/constants/credit';
import { Form, Icon, InputNumber, message, Modal, Radio, Select, Tag, Tooltip, Typography } from 'antd';
import { TICKET_SUBMIT } from './graphql/mutations';
import { GET_CREDIT_LIMIT, GET_PRODUCT_RATE, GET_SPECIAL_PRICE, GET_TRUCK_DRIVERS } from './graphql/queries';

const { Option } = Select;
const { Group } = Radio;
const { Text, Paragraph } = Typography;
const { confirm } = Modal;

const TicketSubmitForm = ({
  currentTicket,
  currentTicketPromotions,
  client,
  form,
  setCurrent,
  currentForm
}) => {
  const { isAdmin, isManager, isSupport } = useAuth();
  const [productRate, setProductRate] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [weight, setWeight] = useState(0);
  const [modifiedWeight, setModifiedWeight] = useState(undefined);
  const [total, setTotal] = useState(0);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [promotion, setPromotion] = useState(currentTicket?.promotion?.id);
  const [specialPrice, setSpecialPrice] = useState();
  const [creditEnough, setCreditEnough] = useState(0);
  const [creditAvailable, setCreditAvailable] = useState(0);
  const [creditLimit, setCreditLimit] = useState();
  const [bill, setBill] = useState(false);
  const [credit, setCredit] = useState(false);
  const [isSocket, setIsSocket] = useState(false);
  const [isStable, setIsStable] = useState(true);
  const { setFieldsValue } = form;
  const isManualInputValid = isAdmin || isManager || isSupport;

  const calculateTotal = useCallback(async () => {
    const TAX = 0.16;

    const currentPromotion = currentTicket.promotion
      ? [currentTicket.promotion]
      : currentTicketPromotions.filter(({ id }) => promotion === id);

    const price =
      currentPromotion.length > 0
        ? currentPromotion[0].product.price
        : specialPrice
        ? specialPrice.price
        : currentTicket.product.price;

    const netWeight = (weight - currentTicket.truck.weight).toFixed(2);
    const taxToSet = bill ? netWeight * price * TAX : 0;
    const totalToSet = (netWeight * price + taxToSet).toFixed(2);

    if (!isSocket) { // If weight is entered manually
      setModifiedWeight(currentTicket.truck.weight + parseFloat(netWeight));
    }

    setTotal(parseFloat(totalToSet));
  }, [
    weight,
    currentTicket,
    currentTicketPromotions,
    promotion,
    isSocket,
    bill,
    specialPrice
  ]);

  useEffect(() => {
    let socket;
    const connect = async () => {
      try {
        const healthCheck = await fetch('http://localhost:5632');
        const percentageProductRate = productRate?.rate ? 1 + productRate?.rate / 100 : 1;
        if (healthCheck.status === 200) {
          socket = ioClient('http://localhost:5632');
          setIsSocket(true);
          socket.on('weight', data => {
            setIsStable(data[data.length - 1] === 'S');
            const weightToSet =
              (Number(data.substring(0, data.length - 1)) / 1000 - currentTicket.truck.weight) *
              percentageProductRate;
            setWeight(weightToSet + currentTicket.truck.weight);
            setModifiedWeight(undefined);
          });
        }
      } catch (err) {
        setIsSocket(false);
      }
    };

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [setFieldsValue, productRate, currentTicket, calculateTotal]);

  useEffect(() => {
    if (isStable) {
      calculateTotal();
    }
  }, [isStable, calculateTotal]);

  useEffect(() => {
    const getProductRate = async () => {
      const {
        data: { productRate: productRateToSet }
      } = await client.query({ query: GET_PRODUCT_RATE });

      setProductRate(productRateToSet);
    };

    getProductRate();
  }, [client]);

  useEffect(() => {
    const {
      truck: { id: truckId },
      client: { id: clientId },
      bill: currentTicketBill
    } = currentTicket;

    const getDrivers = async () => {
      const {
        data: {
          truck: { drivers: driversToSet }
        }
      } = await client.query({
        query: GET_TRUCK_DRIVERS,
        variables: { id: truckId, client: clientId }
      });

      setDrivers(driversToSet);
      setBill(currentTicketBill);
    };

    const getSpecialPrice = async () => {
      const {
        data: { clientPriceByClient: specialPriceToset }
      } = await client.query({
        query: GET_SPECIAL_PRICE,
        variables: { client: currentTicket.client.id, rock: currentTicket.product.id }
      });

      setSpecialPrice(specialPriceToset);
    };

    const getClientCredit = async () => {
      const {
        data: { clientCreditLimit }
      } = await client.query({
        query: GET_CREDIT_LIMIT,
        variables: { client: currentTicket.client.id }
      });

      setCreditLimit(clientCreditLimit?.creditLimit || 0);
    };

    getClientCredit();
    getSpecialPrice();
    getDrivers();
  }, [client, currentTicket]);

  useEffect(() => {
    const balanceAfterCreditTicket = currentTicket.client.balance - total;
    setCreditEnough(balanceAfterCreditTicket * -1 < creditLimit);

    const creditAvailableToSet = creditLimit - currentTicket.client.balance * -1;
    setCreditAvailable(creditAvailableToSet);
  }, [total, currentTicket, creditLimit]);

  useEffect(() => {
    const filteredPromotionsToSet = currentTicketPromotions.filter(availablePromotion => {
      let isPromotionValid = true;

      if (availablePromotion.bill !== null)
        isPromotionValid = isPromotionValid && availablePromotion.bill === bill;
      if (availablePromotion.credit !== null)
        isPromotionValid = isPromotionValid && availablePromotion.credit === credit;

      return isPromotionValid;
    });

    setFilteredPromotions(filteredPromotionsToSet);
  }, [bill, credit, currentTicketPromotions]);

  const handleSubmit = e => {
    e.preventDefault();
    const { id } = currentTicket;

    form.validateFields(async (err, { driver, credit: creditBill, bill: formBill }) => {
      if (err) {
        return;
      }

      if (typeof creditBill !== 'boolean') {
        message.warning('Es necesario seleccionar contado o crédito');
        return;
      }

      if (creditBill === true && !creditEnough) {
        message.warning('El total excede el crédito disponible del cliente, selecciona contado');
        return;
      }

      const weightToSubmit = modifiedWeight ? modifiedWeight : weight;

      confirm({
        title: '¿Continuar?',
        content: (
          <div>
            <Paragraph>Se han seleccionado las siguientes opciones en la boleta:</Paragraph>
            <Paragraph>
              <Text style={{ marginRight: 5 }} strong>
                Tipo de boleta:
              </Text>
              <Tag>{bill ? 'FACTURA' : 'REMISION'}</Tag>
            </Paragraph>
            <Paragraph>
              <Text style={{ marginRight: 5 }} strong>
                Tipo de pago:
              </Text>
              <Tag>{credit ? 'CRÉDITO' : 'CONTADO'}</Tag>
            </Paragraph>
            <Paragraph>
              <Text style={{ marginRight: 5 }} strong>
                Peso neto:
              </Text>
              <Tag>{`${(weightToSubmit - currentTicket.truck.weight).toFixed(2)} tons`}</Tag>
            </Paragraph>
            <Paragraph>
              <Text style={{ marginRight: 5 }} strong>
                Total:
              </Text>
              <Tag color="green">{`$${total}`}</Tag>
            </Paragraph>
            <Paragraph>
              Al continuar, aceptas que no podrás cambiar los datos de la boleta
            </Paragraph>
          </div>
        ),
        okText: 'Continuar',
        cancelText: 'Cancelar',
        okType: 'primary',
        onOk: async () => {
          try {
            await client.mutate({
              mutation: TICKET_SUBMIT,
              variables: {
                ticket: {
                  id,
                  driver: driver[0],
                  weight: weightToSubmit,
                  credit: creditBill,
                  bill: formBill,
                  withScale: isSocket,
                  promotion
                }
              }
            });

            form.resetFields();
            setCurrent();
            message.success('¡La información ha sido actualizada correctamente!');
          } catch (error) {
            message.error('¡Ha habido un error modificando la información!');
          }
        },
        onCancel: () => {}
      });
    });
  };

  return (
    <Modal
      title={`${currentTicket.truck.plates}`}
      visible={currentForm === 'submit'}
      onCancel={() => setCurrent()}
      onOk={handleSubmit}
      okText={isStable ? 'Enviar' : 'Inestable'}
      cancelText="Cancelar"
      okButtonProps={{ disabled: !isStable || weight <= 0 }}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {currentTicket.driver
            ? form.getFieldDecorator('driver', {
                initialValue: [currentTicket.driver],
                rules: [
                  {
                    required: true,
                    message: 'Nombre(s) y apellidos son requeridos'
                  }
                ]
              })(
                <Select allowClear showSearch placeholder="Nombre(s) y apellidos del conductor">
                  {drivers.map(driver => (
                    <Option key={driver} value={driver}>
                      {driver}
                    </Option>
                  ))}
                </Select>
              )
            : form.getFieldDecorator('driver', {
                rules: [
                  {
                    required: true,
                    message: 'Nombre(s) y apellidos son requeridos'
                  }
                ]
              })(
                <Select
                  mode="tags"
                  maxTagCount={1}
                  allowClear
                  showSearch
                  placeholder="Nombre(s) y apellidos del conductor"
                >
                  {drivers.map(driver => (
                    <Option key={driver} value={driver}>
                      {driver}
                    </Option>
                  ))}
                </Select>
              )}
        </Form.Item>
        <Form.Item extra={!isSocket && 'No se ha encontrado ninguna pesa. Ingresar manual'}>
          {(isSocket && (
            <>
              <Text disabled style={{ marginRight: 10 }}>
                Báscula conectada
              </Text>
              <Icon type="check-square" theme="twoTone" />
            </>
          )) || (
            <InputNumber
              style={{ width: '100%' }}
              disabled={!isManualInputValid}
              placeholder={!isManualInputValid ? 'Supervisor requerido' : 'Toneladas registradas en báscula'}
              min={0}
              step={0.01}
              onChange={value => setWeight(value)}
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('bill', {
            initialValue: currentTicket.bill,
            rules: [
              {
                required: true,
                message: '¡Tipo de boleta es requerido!'
              }
            ]
          })(
            <Group
              disabled={!!currentTicket.bill || currentTicket.promotion}
              onChange={({ target: { value } }) => setBill(value)}
            >
              <Radio.Button value={true}>FACTURA</Radio.Button>
              <Radio.Button value={false}>REMISIÓN</Radio.Button>
            </Group>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('credit', { initialValue: currentTicket.credit })(
            <Group
              onChange={({ target: { value } }) => setCredit(value)}
              disabled={currentTicket.promotion}
            >
              <Radio.Button value={false}>CONTADO</Radio.Button>
              <Tooltip
                title={
                  !creditEnough
                    ? 'Cliente no tiene suficiente crédito para la transacción'
                    : isUnlimited(creditLimit)
                    ? 'El cliente tiene crédito ilimitado'
                    : `Cliente tiene disponible $${creditAvailable}`
                }
              >
                <Radio.Button disabled={!creditEnough} value={true}>
                  CRÉDITO
                </Radio.Button>
              </Tooltip>
            </Group>
          )}
        </Form.Item>
        <Form.Item>
          <Select
            style={{ width: '50%' }}
            placeholder={`Promociones disponibles (${filteredPromotions.length})`}
            onChange={promotionToSet => setPromotion(promotionToSet)}
            disabled={currentTicket.promotion}
            defaultValue={(currentTicket.promotion && currentTicket.promotion.id) || undefined}
            size="default"
            allowClear
          >
            {filteredPromotions.length > 0 &&
              filteredPromotions.map(({ id, name, product }) => (
                <Option key={id} value={id}>
                  <Text strong mark>{`${name} a $${product.price}`}</Text>
                </Option>
              ))}
            {currentTicket.promotion && (
              <Option key={currentTicket.promotion.id} value={currentTicket.promotion.id}>
                <Text
                  strong
                  mark
                >{`${currentTicket.promotion.name} a $${currentTicket.promotion.product.price}`}</Text>
              </Option>
            )}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

TicketSubmitForm.propTypes = {
  currentTicket: PropTypes.object.isRequired,
  currentTicketPromotions: PropTypes.array.isRequired,
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  setCurrent: PropTypes.func.isRequired,
  currentForm: PropTypes.string.isRequired
};

export default withApollo(TicketSubmitForm);
