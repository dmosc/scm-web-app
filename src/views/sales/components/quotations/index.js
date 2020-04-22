import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import moment from 'moment';
import { Table, Tag } from 'antd';
import { TableContainer, Card } from './elements';
import Title from './components/title';
import NewQuotation from './components/new-quotation';
import { GET_QUOTATIONS } from './graphql/queries';

const Quotations = ({ client }) => {
  const [quotations, setQuotations] = useState([]);
  const [isNewQuotationOpen, toggleNewQuotation] = useState(false);
  const [filters, setFilters] = useState({
    client: '',
    createdRange: { start: undefined, end: undefined },
    validRange: { start: undefined, end: undefined }
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
        variables: { filters: debouncedFilters }
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

  const columns = [
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio'
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client'
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
      title: 'Flete',
      dataIndex: 'freight',
      key: 'freight',
      render: freight => `$${freight} MXN`
    },
    {
      title: 'Productos',
      dataIndex: 'products',
      key: 'products',
      render: products =>
        products.map(({ rock, price }) => (
          <Tag key={rock.id} color="geekblue">
            {rock.name}: ${price} MXN
          </Tag>
        ))
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
          scroll={{ x: true, y: true }}
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
