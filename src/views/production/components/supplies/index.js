import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import shortid from 'shortid';
import moment from 'moment';
import { Button, Form, Icon, message, Modal, Row, Table, Tabs, Tooltip } from 'antd';
import Title from './components/title';
import { Card, TableContainer } from './elements';
import SupplyForm from './components/supply-form';
import SupplyTransactionInForm from './components/supply-transaction-in-form';
import SupplyTransactionOutForm from './components/supply-transaction-out-form';
import { GET_SUPPLIES, GET_SUPPLY_TRANSACTIONS_IN, GET_SUPPLY_TRANSACTIONS_OUT } from './graphql/queries';
import { DELETE_SUPPLY_TRANSACTION_IN, DELETE_SUPPLY_TRANSACTION_OUT } from './graphql/mutations';

const { TabPane } = Tabs;
const { confirm } = Modal;

const Supplies = () => {
  const [tab, setTab] = useState('OUTS');
  const [supplies, setSupplies] = useState([]);
  const [supplyTransactionsIn, setSupplyTransactionsIn] = useState([]);
  const [supplyTransactionsOut, setSupplyTransactionsOut] = useState([]);
  const [currentSupply, setCurrentSupply] = useState(undefined);
  const [isSupplyFormModalOpen, toggleSupplyFormModal] = useState(false);
  const [isTransactionModalOpen, toggleTransactionModal] = useState(false);
  const suppliesQuery = useQuery(GET_SUPPLIES, { variables: { filters: {} } });
  const supplyTransactionsInQuery = useQuery(GET_SUPPLY_TRANSACTIONS_IN, { variables: { filters: {} } });
  const supplyTransactionsOutQuery = useQuery(GET_SUPPLY_TRANSACTIONS_OUT, { variables: { filters: {} } });
  const [supplyTransactionOutDeleteMutation] = useMutation(DELETE_SUPPLY_TRANSACTION_OUT);
  const [supplyTransactionInDeleteMutation] = useMutation(DELETE_SUPPLY_TRANSACTION_IN);

  useEffect(() => {
    const { data } = suppliesQuery;
    if (data?.supplies)
      setSupplies(data?.supplies);
  }, [suppliesQuery]);

  useEffect(() => {
    const { data } = supplyTransactionsInQuery;
    if (data?.supplyTransactionsIn)
      setSupplyTransactionsIn(data?.supplyTransactionsIn);
  }, [supplyTransactionsInQuery]);

  useEffect(() => {
    const { data } = supplyTransactionsOutQuery;
    if (data?.supplyTransactionsOut)
      setSupplyTransactionsOut(data?.supplyTransactionsOut);
  }, [supplyTransactionsOutQuery]);

  const deleteSupplyTransaction = transaction => {
    confirm({
      title: '¿Estás seguro de que deseas retirar este registro?',
      content: `Una vez eliminado, afectara la información del suministro ${transaction.supply.name}`,
      onOk: async () => {
        if (tab === 'OUTS') {
          await supplyTransactionOutDeleteMutation({ variables: { id: transaction.id } });
          setSupplyTransactionsOut(supplyTransactionsOut.filter(({ id }) => id !== transaction.id));
        } else {
          await supplyTransactionInDeleteMutation({ variables: { id: transaction.id } });
          setSupplyTransactionsIn(supplyTransactionsOut.filter(({ id }) => id !== transaction.id));
        }

        message.success('El registro ha sido removido exitosamente!');
      },
      onCancel: () => {
      }
    });
  };

  const SupplyFormRegister = Form.create({ name: 'supply-form' })(SupplyForm);
  const SupplyTransactionInFormRegister = Form.create({ name: 'supply-transaction-in-form' })(SupplyTransactionInForm);
  const SupplyTransactionOutFormRegister = Form.create({ name: 'supply-transaction-out-form' })(SupplyTransactionOutForm);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      render: quantity => quantity.toFixed(2)
    },
    {
      title: 'Unidad',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Editar">
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => setCurrentSupply(row)}
            />
          </Tooltip>
        </Row>
      )
    }
  ];

  const columnsOuts = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Suministro',
      dataIndex: 'supply',
      key: 'supply',
      render: supply => supply.name
    },
    {
      title: 'Máquina',
      dataIndex: 'machine',
      key: 'machine',
      render: machine => machine.plates
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Creado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: createdBy => `${createdBy.firstName} ${createdBy.lastName}`
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Eliminar">
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => deleteSupplyTransaction(row)}
            />
          </Tooltip>
        </Row>
      )
    }
  ];

  const columnsIns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Suministro',
      dataIndex: 'supply',
      key: 'supply',
      render: supply => supply.name
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Reajuste',
      dataIndex: 'isAdjustment',
      key: 'isAdjustment',
      render: isAdjustment => isAdjustment ? <Icon type="check-square" theme="twoTone"/> : undefined
    },
    {
      title: 'Creado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: createdBy => `${createdBy.firstName} ${createdBy.lastName}`
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Eliminar">
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => deleteSupplyTransaction(row)}
            />
          </Tooltip>
        </Row>
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Tabs
          animated={false}
          onChange={tabPane => setTab(tabPane)}
          defaultActiveKey="OUTS"
          tabBarExtraContent={
            <Button
              style={{ margin: 'auto 10px auto auto' }}
              type="primary"
              icon="plus"
              onClick={() => toggleTransactionModal(true)}
            />
          }
        >
          <TabPane tab="Salidas" key="OUTS"/>
          <TabPane tab="Entradas" key="INS"/>
        </Tabs>
        <Table
          size="small"
          columns={tab === 'OUTS' ? columnsOuts : columnsIns}
          pagination={{ defaultPageSize: 20 }}
          dataSource={(tab === 'OUTS' ? supplyTransactionsOut : supplyTransactionsIn).map(supply => ({ ...supply, key: shortid.generate() }))}
        />
      </Card>
      <Card style={{ width: '80%', marginLeft: 20 }}>
        <Table
          size="small"
          columns={columns}
          pagination={{ defaultPageSize: 20 }}
          title={() => (
            <Title
              toggleSupplyFormModal={toggleSupplyFormModal}
            />
          )}
          dataSource={supplies.map(supply => ({ ...supply, key: shortid.generate() }))}
        />
      </Card>
      {(isSupplyFormModalOpen || currentSupply) && (
        <SupplyFormRegister
          supplies={supplies}
          currentSupply={currentSupply}
          isSupplyFormModalOpen={isSupplyFormModalOpen}
          toggleSupplyFormModal={toggleSupplyFormModal}
          setSupplies={setSupplies}
          setCurrentSupply={setCurrentSupply}
        />
      )}
      {(isTransactionModalOpen && tab === 'INS') && (
        <SupplyTransactionInFormRegister
          supplyTransactionsIn={supplyTransactionsIn}
          isTransactionModalOpen={isTransactionModalOpen}
          toggleTransactionModal={toggleTransactionModal}
          setSupplyTransactionsIn={setSupplyTransactionsIn}
          updateFather={suppliesQuery.refetch}
        />
      )}
      {(isTransactionModalOpen && tab === 'OUTS') && (
        <SupplyTransactionOutFormRegister
          supplyTransactionsOut={supplyTransactionsOut}
          isTransactionModalOpen={isTransactionModalOpen}
          toggleTransactionModal={toggleTransactionModal}
          setSupplyTransactionsOut={setSupplyTransactionsOut}
          updateFather={suppliesQuery.refetch}
        />
      )}
    </TableContainer>
  );
};

export default Supplies;