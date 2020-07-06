import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Button, Form, Row, Table, Tag } from 'antd';
import { Card, TableContainer } from './elements';
import Title from './components/title';
import EditForm from './components/machine-edit-form';
import NewForm from './components/new-machine-form';
import { GET_MACHINES } from './graphql/queries';

const Machines = ({ client }) => {
  const [machines, setMachines] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [loading, setLoading] = useState(true);
  const [currentMachine, setCurrentMachine] = useState(null);
  const [isNewMachineModalOpen, toggleNewMachineModal] = useState(false);
  const debouncedFilters = useDebounce(filters, 1000);

  const NewMachineForm = Form.create({ name: 'machine' })(NewForm);
  const MachineEditForm = Form.create({ name: 'machineEdit' })(EditForm);

  useEffect(() => {
    const getMachines = async () => {
      const {
        data: { machines: machinesToSet }
      } = await client.query({
        query: GET_MACHINES,
        variables: { filters: debouncedFilters }
      });

      if (!machinesToSet) throw new Error('No machines found');

      setLoading(false);
      setMachines(machinesToSet);
    };

    getMachines();
  }, [debouncedFilters, client]);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const onMachineEdit = machine => {
    const machinesToSet = [...machines];

    machinesToSet.forEach(({ id }, i) => {
      if (machine.id === id) machinesToSet[i] = { ...machine };
    });

    setMachines(machinesToSet);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag>{type}</Tag>
    },
    {
      title: 'Placas',
      dataIndex: 'plates',
      key: 'plates'
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: 'Horómetro promedio',
      dataIndex: 'averageHorometer',
      key: 'averageHorometer'
    },
    {
      title: 'Desviación estándar',
      dataIndex: 'standardHorometerDeviation',
      key: 'standardHorometerDeviation'
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Button
            style={{ marginRight: 5 }}
            onClick={() => setCurrentMachine(row)}
            type="default"
            icon="edit"
            size="small"
          />
        </Row>
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Table
          loading={loading}
          columns={columns}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewMachineModal={toggleNewMachineModal}
            />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={machines.map(machineMapped => ({
            ...machineMapped,
            key: shortid.generate()
          }))}
        />
      </Card>
      {currentMachine && (
        <MachineEditForm
          onMachineEdit={onMachineEdit}
          setCurrentMachine={setCurrentMachine}
          currentMachine={currentMachine}
        />
      )}
      {isNewMachineModalOpen && (
        <NewMachineForm
          machines={machines}
          visible={isNewMachineModalOpen}
          toggleNewMachineModal={toggleNewMachineModal}
          setMachines={setMachines}
        />
      )}
    </TableContainer>
  );
};

Machines.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Machines);
