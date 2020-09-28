import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { useAuth } from 'components/providers/withAuth';
import { Button, Input, Typography } from 'antd';
import TitleContainer from './elements';
import { GET_REPORT } from './graphql/queries';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ client, handleFilterChange, toggleNewClientModal, filters }) => {
  const [loading, setLoading] = useState(false);
  const { isSales } = useAuth();
  const canAdd = !isSales;

  const downloadReport = async () => {
    setLoading(true);
    const {
      data: { clientsXLS }
    } = await client.query({
      query: GET_REPORT,
      variables: { filters }
    });

    const link = document.createElement('a');
    link.href = encodeURI(clientsXLS);
    link.download = `Lista-Clientes-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoading(false);
  };

  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de clientes
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar clientes"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      {canAdd && (
        <Button
          style={{ margin: 'auto 10px' }}
          type="primary"
          icon="user-add"
          onClick={() => toggleNewClientModal(true)}
        >
          Añadir
        </Button>
      )}
      <Button
        style={{ margin: 'auto 10px' }}
        loading={loading}
        type="primary"
        icon="file-excel"
        onClick={downloadReport}
      >
        {(loading && 'Generando...') || 'Descargar clientes'}
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  client: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewClientModal: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired
};

export default withApollo(TableTitle);
