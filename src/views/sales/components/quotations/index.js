import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import { printPDF } from 'utils/functions';
import shortid from 'shortid';
import moment from 'moment-timezone';
import { Table, Tag, Typography, Row, Tooltip, Button } from 'antd';
import { TableContainer, Card } from './elements';
import Title from './components/title';
import NewQuotation from './components/new-quotation';
import { GET_QUOTATIONS, GET_PDF } from './graphql/queries';

const { Text } = Typography;

const Quotations = ({ client }) => {
  const [quotations, setQuotations] = useState([]);
  const [isNewQuotationOpen, toggleNewQuotation] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    createdRange: { start: undefined, end: undefined },
    validRange: { start: undefined, end: undefined },
    sortBy: {
      field: 'folio',
      order: 'desc'
    }
  });
  const [loading, setLoading] = useState(true);
  const debouncedFilters = useDebounce(filters, 1000);

  const updateQuotations = () => {
    const getQuotations = async () => {
      setLoading(true);
      const {
        data: { quotations: quotationsToSet }
      } = await client.query({
        query: GET_QUOTATIONS,
        variables: { filters: { ...debouncedFilters, businessName: debouncedFilters.name } }
      });

      setLoading(false);
      setQuotations(quotationsToSet);
    };

    getQuotations();
  };

  useEffect(updateQuotations, [debouncedFilters, client]);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const downloadPDF = async ({ id }) => {
    const {
      data: { quotationPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        id
      }
    });

    printPDF(quotationPDF);
  };

  const columns = [
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio'
    },
    {
      title: 'Atención',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Nombre del negocio',
      dataIndex: 'businessName',
      key: 'businessName'
    },
    {
      title: 'Creado el',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('ll')
    },
    {
      title: 'Vence el',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: date => moment(date).format('ll')
    },
    {
      title: 'Productos',
      render: ({ products, hasFreight }) =>
        products.map(({ rock, price, freight }) => (
          <div key={rock.id} style={{ margin: '3px 0' }}>
            <Tag color="geekblue">
              {rock.name}: ${price} MXN <br />
              {hasFreight && `Flete: $${freight} MXN`}
            </Tag>
          </div>
        ))
    },
    {
      title: 'Creado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: createdBy => (
        <Text key={createdBy.id}>
          {createdBy.firstName} {createdBy.lastName}
        </Text>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Imprimir">
            <Button onClick={() => downloadPDF(row)} type="primary" icon="printer" size="small" />
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
            <Title
              toggleNewQuotation={toggleNewQuotation}
              handleFilterChange={handleFilterChange}
            />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={quotations.map(userMapped => ({ ...userMapped, key: shortid.generate() }))}
        />
      </Card>
      {isNewQuotationOpen && (
        <NewQuotation
          updateFather={updateQuotations}
          visible={isNewQuotationOpen}
          toggleNewQuotation={toggleNewQuotation}
        />
      )}
    </TableContainer>
  );
};

Quotations.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Quotations);
