import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment';
import shortid from 'shortid';
import { Button, Form, Modal, Row, Table, Tag, Tooltip } from 'antd';
import Title from './components/title';
import NewBoreHole from './components/new-bore-hole';
import { Card, TableContainer } from './elements';
import { GET_BORE_HOLES } from './graphql/queries';
import { DELETE_BORE_HOLE } from './graphql/mutations';

const { confirm, message } = Modal;

const BoreHoles = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isNewBoreHoleModalOpen, toggleNewBoreHoleModal] = useState(false);
  const [currentBoreHole, setCurrentBoreHole] = useState(undefined);
  const [boreHoles, setBoreHoles] = useState([]);
  const debouncedSearch = useDebounce(search, 500);
  const boreHolesQuery = useQuery(GET_BORE_HOLES, {
    variables: { filters: { search: debouncedSearch } }
  });
  const [boreHoleDeleteMutation] = useMutation(DELETE_BORE_HOLE);

  useEffect(() => {
    setLoading(true);
    if (boreHolesQuery.data) {
      setBoreHoles(boreHolesQuery.data.boreHoles);
      setLoading(false);
    }
  }, [boreHolesQuery, debouncedSearch]);

  const deleteBoreHole = boreHoleToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta barrenación?',
      content:
        'Una vez eliminada ya no será considerada para los reportes ni aparecerá en la lista',
      okType: 'danger',
      onOk: async () => {
        await boreHoleDeleteMutation({ variables: { id: boreHoleToDelete.id } });

        setBoreHoles(boreHoles.filter(({ id }) => id !== boreHoleToDelete.id));

        message.success(`La barrenación ${boreHoleToDelete.folio} ha sido removida`);
      },
      onCancel: () => {}
    });
  };

  const NewBoreHoleForm = Form.create({ name: 'new-bore-hole' })(NewBoreHole);

  const columns = [
    {
      title: 'Fecha de registro',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD MMMM YYYY')
    },
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio',
      render: folio => <Tag color="blue">{folio}</Tag>
    },
    {
      title: 'Máquina',
      dataIndex: 'machine',
      key: 'machine',
      render: machine => {
        return (
          <>
            <Tooltip title="Nombre de referencia">
              <Tag>{machine.name}</Tag>
            </Tooltip>
            <Tooltip title="Modelo">
              <Tag>{machine.model}</Tag>
            </Tooltip>
            <Tooltip title="Tipo">
              <Tag>{machine.type}</Tag>
            </Tooltip>
          </>
        );
      }
    },
    {
      title: 'Metros',
      dataIndex: 'meters',
      key: 'meters'
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
          <Tooltip placement="top" title="Editar">
            <Button
              type="primary"
              icon="edit"
              size="small"
              style={{ marginRight: 5 }}
              onClick={() => setCurrentBoreHole(row)}
            />
          </Tooltip>
          <Tooltip placement="top" title="Eliminar">
            <Button type="danger" icon="delete" size="small" onClick={() => deleteBoreHole(row)} />
          </Tooltip>
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
            <Title toggleNewBoreHoleModal={toggleNewBoreHoleModal} setSearch={setSearch} />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={boreHoles.map(boreHole => ({ ...boreHole, key: shortid.generate() }))}
        />
      </Card>
      {(isNewBoreHoleModalOpen || currentBoreHole) && (
        <NewBoreHoleForm
          boreHoles={boreHoles}
          currentBoreHole={currentBoreHole}
          isNewBoreHoleModalOpen={isNewBoreHoleModalOpen}
          toggleNewBoreHoleModal={toggleNewBoreHoleModal}
          setBoreHoles={setBoreHoles}
          setCurrentBoreHole={setCurrentBoreHole}
        />
      )}
    </TableContainer>
  );
};

export default BoreHoles;
