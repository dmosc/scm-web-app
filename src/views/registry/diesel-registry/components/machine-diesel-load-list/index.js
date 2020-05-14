import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import moment from 'moment-timezone';
import { Form, Table, Tag } from 'antd';
import MachineDieselLoadForm from './components/machine-diesel-load-form';
import { GET_MACHINE_DIESEL_LOADS } from './graphql/queries';

const MachineDieselLoadList = ({ tab, isModalOpen, setIsModalOpen, client }) => {
  const [loading, setLoading] = useState(false);
  const [machineDieselLoads, setMachineDieselLoads] = useState([]);
  const [latestMachineDieselLoad, setLatestMachineDieselLoad] = useState(null);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD HH:MM:SS')
    },
    {
      title: 'Indicador anterior',
      dataIndex: 'previousTankIndicator',
      key: 'previousTankIndicator'
    },
    {
      title: 'Indicador actual',
      dataIndex: 'tankIndicator',
      key: 'tankIndicator'
    },
    {
      title: 'Horómetro',
      dataIndex: 'horometer',
      key: 'horometer'
    },
    {
      title: 'Conductor',
      dataIndex: 'driver',
      key: 'driver',
      render: driver => <Tag color="blue">{driver.toUpperCase()}</Tag>
    },
    {
      title: 'Máquina',
      dataIndex: 'machine',
      key: 'machine',
      render: machine => <Tag color="blue">{machine.name.toUpperCase()}</Tag>
    },
    {
      title: 'Registrado por',
      dataIndex: 'registeredBy',
      key: 'registeredBy',
      render: user => `${user.firstName} ${user.lastName}`
    }
  ];

  useEffect(() => {
    const getMachineDieselLoads = async () => {
      const {
        data: { machineDieselLoads: machineDieselLoadsToSet }
      } = await client.query({
        query: GET_MACHINE_DIESEL_LOADS,
        variables: { filters: {} }
      });

      if (!machineDieselLoadsToSet) throw new Error('No machine diesel loads found');

      if (machineDieselLoadsToSet.length > 0) {
        setLatestMachineDieselLoad(machineDieselLoadsToSet[0]);
      }

      setLoading(false);
      setMachineDieselLoads(machineDieselLoadsToSet);
    };

    getMachineDieselLoads();
  }, [machineDieselLoads, client]);

  const NewMachineDieselLoadForm = Form.create({ name: 'machine-diesel-load-form' })(
    MachineDieselLoadForm
  );

  return (
    <>
      <Table
        loading={loading}
        columns={columns}
        size="small"
        scroll={{ x: true, y: true }}
        pagination={{ defaultPageSize: 20 }}
        dataSource={machineDieselLoads.map(machineDieselLoad => ({
          ...machineDieselLoad,
          key: shortid.generate()
        }))}
      />
      {isModalOpen && tab === 'salidas' && (
        <NewMachineDieselLoadForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          latestMachineDieselLoad={latestMachineDieselLoad}
          machineDieselLoads={machineDieselLoads}
          setMachineDieselLoads={setMachineDieselLoads}
        />
      )}
    </>
  );
};

MachineDieselLoadList.propTypes = {
  tab: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(MachineDieselLoadList);
