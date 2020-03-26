import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import {
  Progress,
  Button,
  InputNumber,
  Tag,
  Row,
  Typography,
  Form,
  Col,
  Spin,
  Modal,
  message
} from 'antd';
import { CREATE_CREDIT_LIMIT, ADD_TO_BALANCE } from './graphql/mutations';
import { GET_CLIENT_BALANCE, GET_CREDIT_LIMIT } from './graphql/queries';

const { Text } = Typography;
const { Item } = Form;
const { confirm } = Modal;

const CreditStatus = ({ client, currentClient }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState();
  const [creditLimit, setCreditLimit] = useState();
  const [percentage, setPercentage] = useState();
  const [showCreditEdit, toggleCreditEdit] = useState(false);
  const [toAdd, setToAdd] = useState(0);
  const [showAddBalance, toggleAddBalance] = useState(false);
  const [initialCredit, setInitialCredit] = useState();

  const updateCreditBalance = () => {
    const getData = async () => {
      const [
        {
          data: { client: clientToSet }
        },
        {
          data: { clientCreditLimit }
        }
      ] = await Promise.all([
        client.query({ query: GET_CLIENT_BALANCE, variables: { id: currentClient.id } }),
        client.query({ query: GET_CREDIT_LIMIT, variables: { client: currentClient.id } })
      ]);

      const balanceToSet = clientToSet.balance;
      const creditLimitToSet = clientCreditLimit?.creditLimit || 0;

      setBalance(balanceToSet);
      setCreditLimit(creditLimitToSet);

      if (balanceToSet >= 0) {
        setPercentage(0);
      } else {
        const percentageToSet = (balanceToSet * -1) / creditLimitToSet;
        setPercentage((percentageToSet * 100).toFixed(2));
      }

      setLoading(false);
    };

    getData();
  };

  useEffect(updateCreditBalance, [client, currentClient]);

  const submitCreditChange = async () => {
    if (initialCredit === creditLimit) {
      message.info('El crédito colocado no ha cambiado');
      toggleCreditEdit(false);
      return;
    }
    confirm({
      title: '¿Aplicar nuevo límite de crétido?',
      content: 'Este cambio quedará guardado en el historial',
      cancelText: 'Cancelar',
      okType: 'primary',
      onOk: async () => {
        await client.mutate({
          mutation: CREATE_CREDIT_LIMIT,
          variables: {
            clientCreditLimit: {
              client: currentClient.id,
              creditLimit
            }
          }
        });

        updateCreditBalance();
        toggleCreditEdit(false);
        message.success('¡El límite de crédito ha sido actualizado correctamente!');
      },
      onCancel: () => {
        message.error('Se ha cancelado el cambio de límite de crédito');
      }
    });
  };

  const addToBalance = () => {
    confirm({
      title: `¿Abonar al balance de ${currentClient.businessName}?`,
      content: 'Esto permitirá al cliente seguir usando su crédito',
      cancelText: 'Cancelar',
      okType: 'primary',
      onOk: async () => {
        await client.mutate({
          mutation: ADD_TO_BALANCE,
          variables: {
            client: currentClient.id,
            toAdd
          }
        });

        updateCreditBalance();
        toggleAddBalance(false);
        message.success(
          `¡Se han añadido $${toAdd}MXN a favor del balancde de ${currentClient.businessName}!`
        );
        setToAdd(0);
      },
      onCancel: () => {
        message.error('No se añadió nada al balance');
      }
    });
  };

  return (
    <>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          <Row style={{ display: 'flex', alignItems: 'center', padding: 40 }}>
            <Col
              style={{
                display: 'flex',
                textAlign: 'center',
                flexDirection: 'column',
                marginRight: 'auto'
              }}
            >
              <Progress
                strokeColor={{
                  '0%': '#f5222d',
                  '100%': '#108ee9'
                }}
                type="dashboard"
                percent={Number(percentage)}
              />
              <Text>Crédito utilizado</Text>
            </Col>
            <Col>
              <Row style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
                <Text style={{ marginRight: 'auto' }}>
                  Saldo {balance >= 0 ? 'a favor: ' : 'en contra: '}
                </Text>
                <Tag style={{ marginLeft: 5 }} color={balance >= 0 ? 'blue' : 'orange'}>
                  ${Math.abs(balance)}MXN
                </Tag>
              </Row>
              {showCreditEdit ? (
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ marginRight: 'auto', marginBottom: 24 }}>Crédito:</Text>
                  <Item style={{ display: 'flex' }}>
                    <InputNumber
                      required
                      placeholder="Límite de crédito"
                      value={creditLimit}
                      onChange={creditLimitChanged => setCreditLimit(creditLimitChanged)}
                      style={{ width: 'max-content', flexGrow: 1, marginRight: 10 }}
                      min={0}
                      step={0.01}
                    />
                    <Button onClick={submitCreditChange} type="primary" icon="check" />
                  </Item>
                </Row>
              ) : (
                <Row style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
                  <Text style={{ marginRight: 'auto' }}>Crédito:</Text>
                  <Tag style={{ marginLeft: 5 }} color="blue">
                    ${creditLimit}MXN
                  </Tag>
                  <Button
                    icon="edit"
                    onClick={() => {
                      setInitialCredit(creditLimit);
                      toggleCreditEdit(true);
                    }}
                  />
                </Row>
              )}
            </Col>
          </Row>
          {showAddBalance ? (
            <Row style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: 'auto', marginBottom: 24 }}>Abonar:</Text>
              <Item style={{ display: 'flex' }}>
                <InputNumber
                  required
                  placeholder="Indica la cantidad a abonar"
                  value={toAdd}
                  onChange={toAddChange => setToAdd(toAddChange)}
                  style={{ width: 'max-content', flexGrow: 1, marginRight: 10 }}
                  min={1}
                  step={0.01}
                />
                <Button onClick={addToBalance} type="primary" icon="check" />
              </Item>
            </Row>
          ) : (
            <Row>
              <Button
                onClick={() => toggleAddBalance(true)}
                style={{ width: '100%' }}
                icon="plus"
                variant="primary"
              >
                Abonar al balance
              </Button>
            </Row>
          )}
        </>
      )}
    </>
  );
};

CreditStatus.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired
};

export default withApollo(CreditStatus);
