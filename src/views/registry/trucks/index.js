import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Table, notification, Button, Tag, Modal, Row } from 'antd';
import { withApollo } from 'react-apollo';
import shortid from 'shortid';
import { GET_TRUCKS } from './graphql/queries';
import { DELETE_TRUCK } from './graphql/mutations';
import { TableContainer, Card } from './elements';
import Title from './components/title';
import EditForm from './components/truck-edit-form';
import NewForm from './components/new-truck-form';

const { confirm } = Modal;

const Trucks = ({ client }) => {
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isNewTruckModalOpen, toggleNewTruckModal] = useState(false);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const NewTruckForm = Form.create({ name: 'truck' })(NewForm);
  const TruckEditForm = Form.create({ name: 'truckEdit' })(EditForm);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { trucks: trucksToSet }
        } = await client.query({
          query: GET_TRUCKS,
          variables: { filters }
        });

        setTrucks(trucksToSet);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: 'No se han podido cargar los camiones correctamente.'
        });
      }
    };

    getData();
  }, [filters, client]);

  const deleteTruck = truckToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar a este camión?',
      content: 'Una vez eliminado, ya no aparecerá en la lista de camiones',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_TRUCK,
          variables: { id: truckToDelete.id }
        });

        setTrucks(trucks.filter(({ id }) => id !== truckToDelete.id));

        notification.open({
          message: `El camión ${truckToDelete.plates} ha sido removido`
        });
      },
      onCancel: () => {}
    });
  };

  const onTruckEdit = truck => {
    const oldTrucks = [...trucks];

    oldTrucks.forEach(({ id }, i) => {
      if (truck.id === id) oldTrucks[i] = { ...truck };
    });

    setTrucks(oldTrucks);
  };

  const columns = [
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
      title: 'Negocio',
      dataIndex: 'client',
      key: 'client',
      render: ({ businessName }) => businessName
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center'
    },
    {
      title: 'Conductores',
      dataIndex: 'drivers',
      key: 'drivers',
      render: drivers =>
        drivers.map(tag => (
          <Tag color="blue" key={tag}>
            {tag.toUpperCase()}
          </Tag>
        ))
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Button
            style={{ marginRight: 5 }}
            onClick={() => setCurrentTruck(row)}
            type="default"
            icon="edit"
            size="small"
          />
          <Button onClick={() => deleteTruck(row)} type="danger" icon="delete" size="small" />
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
              toggleNewTruckModal={toggleNewTruckModal}
            />
          )}
          size="small"
          scroll={{ x: true, y: true }}
          pagination={{ defaultPageSize: 20 }}
          dataSource={trucks.map(truckMapped => ({ ...truckMapped, key: shortid.generate() }))}
        />
      </Card>
      {currentTruck && (
        <TruckEditForm
          onTruckEdit={onTruckEdit}
          setCurrentTruck={setCurrentTruck}
          currentTruck={currentTruck}
        />
      )}
      {isNewTruckModalOpen && (
        <NewTruckForm
          trucks={trucks}
          visible={isNewTruckModalOpen}
          toggleNewTruckModal={toggleNewTruckModal}
          setTrucks={setTrucks}
        />
      )}
    </TableContainer>
  );
};

Trucks.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Trucks);
