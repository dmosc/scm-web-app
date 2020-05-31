import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button, Form, List, message, Modal, Progress, Row, Tag, Tooltip, Typography } from 'antd';
import NewGoal from './components/new-goal';
import { GET_GOALS_SUMMARY } from './graphql/queries';
import { DELETE_GOAL } from './graphql/mutations';

const { confirm } = Modal;
const { Text } = Typography;

const Goals = ({ client }) => {
  const [goalsSummary, setGoalsSummary] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const NewGoalRegister = Form.create({ name: 'new' })(NewGoal);

  useEffect(() => {
    const getGoals = async () => {
      const { data, errors } = await client.query({ query: GET_GOALS_SUMMARY });

      if (!errors) {
        setGoalsSummary(data.goalsSummary || []);
      } else {
        message.error('Ha habido un error cargando las metas!');
      }
    };

    getGoals();
  }, [client]);

  const deleteGoal = goalToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta meta?',
      content: 'Una vez eliminada ya no se le dara seguimiento.',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_GOAL,
          variables: { id: goalToDelete.id }
        });

        setGoalsSummary(goalsSummary.filter(({ goal }) => goal.id !== goalToDelete.id));

        message.success(`La meta ${goalToDelete.name} ha sido eliminada`);
      },
      onCancel: () => {}
    });
  };

  return (
    <>
      <List
        size="small"
        style={{ height: '30vh', overflow: 'scroll' }}
        bordered
        dataSource={goalsSummary}
        renderItem={goalSummary => (
          <List.Item
            actions={[
              <Tooltip placement="top" title="Eliminar">
                <Button
                  style={{ marginRight: 5 }}
                  onClick={() => deleteGoal(goalSummary.goal)}
                  type="danger"
                  icon="delete"
                  size="small"
                />
              </Tooltip>
            ]}
            key={goalSummary.goal?.id}
          >
            <Row>
              <Row>
                <Tooltip title={goalSummary?.goal?.rocks.map(rock => rock.name).join(', ')}>
                  <Text
                    strong
                  >{`${goalSummary?.goal.name} [${goalSummary?.goal.rocks.length}]`}</Text>
                </Tooltip>
              </Row>
              <Row>
                <Text disabled>{`${moment(goalSummary?.goal.start).format('ll')} - ${moment(
                  goalSummary?.goal.end
                ).format('ll')}`}</Text>
              </Row>
              <Row>
                <Tag>
                  {`${(goalSummary?.tons).toFixed(2)}/${(goalSummary?.goal.tons).toFixed(2)} tons`}
                </Tag>
              </Row>
              <Row>
                <Progress
                  percent={parseFloat(
                    ((goalSummary?.tons / goalSummary?.goal.tons) * 100).toFixed(2)
                  )}
                />
              </Row>
            </Row>
          </List.Item>
        )}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button style={{ marginTop: 5 }} onClick={() => setIsModalOpen(true)}>
          Crear
        </Button>
      </div>
      {isModalOpen && (
        <NewGoalRegister
          isModalOpen={isModalOpen}
          goalsSummary={goalsSummary}
          setIsModalOpen={setIsModalOpen}
          setGoalsSummary={setGoalsSummary}
        />
      )}
    </>
  );
};

Goals.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Goals);
