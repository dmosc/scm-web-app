import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { Button, Collapse, Drawer, Icon, message, Row, Tag, Typography } from 'antd';
import { CollapseContainer, Column, ColumnTitle } from './elements';
import { END_PRODUCTION_TURN } from './graphql/mutations';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const TurnSummary = ({ productionTurnSummary, productionTurn, showSummary, setShowSummary, setProductionTurn }) => {
  const [loading, setLoading] = useState(false);
  const [productionTurnEnd] = useMutation(END_PRODUCTION_TURN);

  const handleSubmit = async e => {
    setLoading(true);
    e.preventDefault();

    try {
      const { errors } = await productionTurnEnd({ variables: { productionTurn: { id: productionTurn.id } } });

      if (errors) {
        errors.forEach(error => message.error(error.message));
        return;
      }

      setProductionTurn(undefined);
    } catch (error) {
      message.error(error.message);
    }

    setLoading(false);
  };

  if (!productionTurn || !productionTurnSummary) {
    return <Drawer>Cargando...</Drawer>;
  }

  return (
    <Drawer
      title={`RESUMEN TURNO #${productionTurn.folio}`}
      width="50%"
      visible={showSummary}
      onClose={() => setShowSummary(false)}
    >
      <Row
        type="flex"
        justify="space-around"
        align="middle"
        gutter={{ xs: 8, sm: 16, md: 24 }}
      >
        <Column span={6}>
          <ColumnTitle color="#eb2f96">VIAJES</ColumnTitle>
          <Title level={4}>{productionTurnSummary.totalLaps}</Title>
        </Column>
        <Column span={6}>
          <ColumnTitle color="#52c41a">TONS</ColumnTitle>
          <Title level={4}>{productionTurnSummary.tons}</Title>
        </Column>
        <Column span={6}>
          <ColumnTitle color="#f5222d">MINUTOS EFECTIVOS</ColumnTitle>
          <Title level={4}>{productionTurnSummary.effectiveMinutes}</Title>
        </Column>
        <Column span={6}>
          <ColumnTitle color="#1890ff">MINUTOS TOTALES</ColumnTitle>
          <Title level={4}>{productionTurnSummary.totalMinutes}</Title>
        </Column>
      </Row>
      <Row>
        <CollapseContainer
          expandIcon={({ isActive }) => (
            <Icon type="caret-right" rotate={isActive ? 90 : 0}/>
          )}
        >
          {productionTurnSummary.laps.map(lap => {
            const lapStart = new Date(lap.start);
            const lapEnd = new Date(lap.end);
            const differenceInMinutes = (lapEnd - lapStart) / 60000;
            return (
              <Panel
                key={lap.id}
                header={`${lapStart.toLocaleTimeString()} - ${lapEnd.toLocaleTimeString()}`}
                extra={
                  lap.tons === 0 ?
                    <Tag color="red">Cancelada</Tag> :
                    <Tag color="blue">
                      {`${differenceInMinutes.toFixed(2)} minutos`}
                    </Tag>
                }
              >
                <Row
                  gutter={{ xs: 8, sm: 16, md: 24 }}
                >
                  <Column span={6}>
                    <Text code>MÁQUINA</Text>
                    <Title level={4}>{lap.machine.name}</Title>
                  </Column>
                  <Column span={6}>
                    <Text code>CONDUCTOR</Text>
                    <Title level={4}>{`${lap.driver.firstName} ${lap.driver.lastName}`}</Title>
                  </Column>
                  <Column span={6}>
                    <Text code>TONS</Text>
                    <Title level={4}>{lap.tons}</Title>
                  </Column>
                  <Column span={6}>
                    <Text code>OBSERVACIONES</Text>
                    <Title level={4}>{`${lap.observations.length}`}</Title>
                  </Column>
                </Row>
              </Panel>
            );
          })}
        </CollapseContainer>
      </Row>
      <Row style={{ margin: 10 }} type="flex" justify="end" align="middle">
        <Button
          type="danger"
          htmlType="submit"
          icon="stop"
          style={{ margin: '0px 5px' }}
          loading={loading}
          onClick={handleSubmit}
        >
          {(loading && 'Espere..') || 'Terminar turno'}
        </Button>
      </Row>
    </Drawer>
  );
};

TurnSummary.defaultProps = {
  productionTurnSummary: undefined,
  productionTurn: undefined
};

TurnSummary.propTypes = {
  productionTurnSummary: PropTypes.object,
  productionTurn: PropTypes.object,
  showSummary: PropTypes.bool.isRequired,
  setShowSummary: PropTypes.func.isRequired,
  setProductionTurn: PropTypes.func.isRequired
};

export default TurnSummary;