import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ioClient from 'socket.io-client';
import { withApollo } from 'react-apollo';
import { isUnlimited } from 'utils/constants/credit';
import { Form, InputNumber, message, Modal, Radio, Select, Tooltip, Typography } from 'antd';
import { TICKET_SUBMIT } from './graphql/mutations';
import {
  GET_CREDIT_LIMIT,
  GET_PRODUCT_RATE,
  GET_SPECIAL_PRICE,
  GET_TRUCK_DRIVERS
} from './graphql/queries';

const { Option } = Select;
const { Group } = Radio;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const TicketSubmitForm = ({
  currentTicket,
  currentTicketPromotions,
  client,
  form,
  setCurrent,
  currentForm
}) => {
  const [productRate, setProductRate] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadedInitialData, setLoadedInitialData] = useState(false);
  const [weight, setWeight] = useState(0);
  const [total, setTotal] = useState(0);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [promotion, setPromotion] = useState(currentTicket?.promotion?.id);
  const [specialPrice, setSpecialPrice] = useState();
  const [creditEnough, setCreditEnough] = useState(0);
  const [creditAvailable, setCreditAvailable] = useState(0);
  const [creditLimit, setCreditLimit] = useState();
  const [tax, setTax] = useState(0);
  const [bill, setBill] = useState(false);
  const [credit, setCredit] = useState(false);
  const [isSocket, setIsSocket] = useState();
  const [isStable, setIsStable] = useState(true);
  const { setFieldsValue } = form;

  useEffect(() => {
    let socket;
    const connect = async () => {
      try {
        const healthCheck = await fetch('http://localhost:5632');
        if (healthCheck.status === 200) {
          socket = ioClient('http://localhost:5632');
          setIsSocket(true);
          socket.on('weight', data => {
            setIsStable(data[data.length - 1] === 'S');
            const weightToSet = Number(data.substring(0, data.length - 1)) / 1000;
            setFieldsValue({
              weight: weightToSet
            });
            setWeight(weightToSet);
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
  }, [setFieldsValue]);

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
      setLoadedInitialData(true);
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
    if (loadedInitialData) {
      const calculateTotal = async () => {
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

        const percentageProductRate = productRate?.rate ? 1 + productRate?.rate / 100 : 1;

        const totalWeight =
          currentTicket.totalWeight && weight === 0
            ? currentTicket.totalWeight
            : (weight - currentTicket.truck.weight).toFixed(2);
        const taxToSet = bill ? totalWeight * price * TAX : 0;

        const totalToSet = (totalWeight * percentageProductRate * price + taxToSet).toFixed(2);

        if (totalToSet > 0) {
          setTotal(totalToSet);
          setTax(taxToSet.toFixed(2));
        } else {
          setTotal(0);
          setTax(0);
        }
      };

      calculateTotal();
    }
  }, [
    specialPrice,
    loadedInitialData,
    bill,
    currentTicket,
    tax,
    weight,
    promotion,
    currentTicketPromotions,
    productRate
  ]);

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

    form.validateFields(
      async (err, { driver, weight: formWeight, credit: creditBill, bill: formBill }) => {
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

        confirm({
          title: '¿Continuar?',
          content: (
            <div>
              <Paragraph>Se han seleccionado las siguientes opciones en la boleta:</Paragraph>
              <Paragraph>
                <Text underline>Tipo de boleta:</Text>
                <Text strong> {bill ? 'FACTURA' : 'REMISION'}</Text>
              </Paragraph>
              <Paragraph>
                <Text underline>Tipo de pago:</Text>
                <Text strong> {bill ? 'CRÉDITO' : 'CONTADO'}</Text>
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
                    weight: formWeight,
                    credit: creditBill,
                    bill: formBill,
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
      }
    );
  };

  return (
    <Modal
      title={`${currentTicket.truck.plates}`}
      visible={currentForm === 'submit'}
      onCancel={() => setCurrent()}
      onOk={handleSubmit}
      okText={isStable ? 'Enviar' : 'Inestable'}
      okButtonProps={{
        disabled: !isStable
      }}
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
        <Form.Item
          extra={isSocket ? 'Pesa conectada' : 'No se ha encontrado ninguna pesa. Ingresar manual'}
        >
          {form.getFieldDecorator('weight', {
            initialValue: currentTicket.weight || currentTicket.truck.weight,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Toneladas en báscula son requeridas!'
              },
              {
                type: 'number',
                min: Number(currentTicket.truck.weight),
                message: 'El peso registrado es menor al peso original del camión'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Toneladas registrados en báscula"
              min={0}
              readOnly={isSocket}
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
