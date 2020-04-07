import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import moment from 'moment';
import { Form, Table } from 'antd';
import TankDieselLoadForm from './components/tank-diesel-load-form';
import { GET_TANK_DIESEL_LOADS } from './graphql/queries';

const TankDieselLoadList = ({ tab, isModalOpen, setIsModalOpen, client }) => {
  const [loading, setLoading] = useState(false);
  const [tankDieselLoads, setTankDieselLoads] = useState([]);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD HH:MM:SS')
    },
    {
      title: 'Indicador actual',
      dataIndex: 'tankIndicator',
      key: 'tankIndicator'
    },
    {
      title: 'Carga total',
      dataIndex: 'load',
      key: 'load'
    },
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference'
    },
    {
      title: 'Comentarios',
      dataIndex: 'comments',
      key: 'comments'
    },
    {
      title: 'Registrado por',
      dataIndex: 'registeredBy',
      key: 'registeredBy',
      render: user => `${user.firstName} ${user.lastName}`
    }
  ];

  useEffect(() => {
    const getTankDieselLoads = async () => {
      const {
        data: { tankDieselLoads: tankDieselLoadsToSet }
      } = await client.query({
        query: GET_TANK_DIESEL_LOADS,
        variables: { filters: {} }
      });

      if (!tankDieselLoadsToSet) throw new Error('No tank diesel loads found');

      setLoading(false);
      setTankDieselLoads(tankDieselLoadsToSet);
    };

    getTankDieselLoads();
  }, [tankDieselLoads, client]);

  const NewTankDieselLoadForm = Form.create({ name: 'tank-diesel-load-form' })(TankDieselLoadForm);

  return (
    <>
      <Table
        loading={loading}
        columns={columns}
        size="small"
        scroll={{ x: true, y: true }}
        pagination={{ defaultPageSize: 20 }}
        dataSource={tankDieselLoads.map(tankDieselLoad => ({
          ...tankDieselLoad,
          key: shortid.generate()
        }))}
      />
      {isModalOpen && tab === 'entradas' && (
        <NewTankDieselLoadForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          tankDieselLoads={tankDieselLoads}
          setTankDieselLoads={setTankDieselLoads}
        />
      )}
    </>
  );
};

TankDieselLoadList.propTypes = {
  tab: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(TankDieselLoadList);
