import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { Button, Form, Input, message, Modal } from 'antd';
import { END_OBSERVATION, INIT_OBSERVATION } from './graphql/mutations';

const { confirm } = Modal;
const { TextArea } = Input;

const ObservationForm = ({ form, currentLap, currentObservation, setCurrentLap, setCurrentObservation }) => {
  const [loading, setLoading] = useState(false);
  const [observationInitMutation] = useMutation(INIT_OBSERVATION);
  const [observationEndMutation] = useMutation(END_OBSERVATION);

  const observationInit = () => {
    confirm({
      title: '¿Está seguro de que desea iniciar la observación?',
      content: 'Una vez iniciada, el reloj empezará a correr hasta finalizar.',
      okType: 'danger',
      okText: 'Iniciar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const { data } = await observationInitMutation({
            variables: { observation: { lap: currentLap.id } }
          });

          const currentObservationToSet = data?.observationInit;

          if (currentObservationToSet) {
            setCurrentObservation(currentObservationToSet);
            const time = new Date(currentObservationToSet.start).toLocaleTimeString();
            message.success(`la observación ha sido iniciada a las ${time}`);
          }
        } catch (e) {
          message.error('Ha habido un error iniciando la observación!');
        }
      },
      onCancel: () => {
      }
    });
  };

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { description }) => {
        if (!err) {
          const { data: { observationEnd } } = await observationEndMutation({
            variables: { observation: { id: currentObservation.id, description } }
          });

          const currentLapToSet = { ...currentLap };
          currentLapToSet.observations = [observationEnd, ...currentLapToSet.observations];

          setCurrentObservation(undefined);
          setCurrentLap(currentLapToSet);
          message.success('La observación ha sido registrada exitosamente!');
          form.resetFields();
        } else {
          message.error('Ha habido un error registrando la observación!');
          setLoading(false);
        }
      }
    );
  };

  return (
    <>
      {!currentObservation &&
      <Button
        type="primary"
        icon="play-circle"
        style={{ marginRight: 10 }}
        onClick={observationInit}
      >
        Iniciar observación
      </Button>}
      {currentObservation &&
      <Form title={`Desde ${currentObservation.start}`} onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('description', {
            rules: [
              {
                required: true,
                message: 'Una descripción es necesaria!'
              }
            ]
          })(
            <TextArea
              style={{ padding: 20, fontWeight: 'bold' }}
              placeholder="Descripción de la observación"
              autoSize={{ minRows: 8, maxRows: 8 }}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Registrar'}
          </Button>
        </Form.Item>
      </Form>}
    </>
  );
};

ObservationForm.defaultProps = {
  currentLap: undefined,
  currentObservation: undefined
};

ObservationForm.propTypes = {
  form: PropTypes.object.isRequired,
  currentLap: PropTypes.object,
  currentObservation: PropTypes.object,
  setCurrentLap: PropTypes.func.isRequired,
  setCurrentObservation: PropTypes.func.isRequired
};

export default ObservationForm;