import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Avatar, Tag, Timeline } from 'antd';
import md5 from 'md5';
import moment from 'moment';
import { Container, ResponsableBlock, ResponsableCol } from './elements';

const { Paragraph, Title } = Typography;
const { Item } = Timeline;

const EventsTimeLine = ({ usersInvolved, in: inDate, load, out }) => {
  return (
    <Container>
      <Title style={{ marginBottom: 20 }} level={4}>
        Eventos
      </Title>
      <Timeline>
        <Item>
          <ResponsableBlock>
            <ResponsableCol>
              <Avatar
                style={{
                  marginRight: 10,
                  background: `#${usersInvolved.guard &&
                    md5(usersInvolved.guard?.username).substring(0, 6)}`
                }}
              >
                {usersInvolved.guard?.firstName[0]?.toUpperCase()}
                {usersInvolved.guard?.lastName[0]?.toUpperCase()}
              </Avatar>
            </ResponsableCol>
            <ResponsableCol>
              <Paragraph strong>
                {usersInvolved.guard?.firstName} {usersInvolved.guard?.lastName}
              </Paragraph>
              <Tag size="small" color="blue">
                Guardia
              </Tag>
              <Paragraph type="secondary">Ingresó el {moment(inDate).format('LLL')}</Paragraph>
            </ResponsableCol>
          </ResponsableBlock>
        </Item>
        <Item>
          <ResponsableBlock>
            <ResponsableCol>
              <Avatar
                style={{
                  marginRight: 10,
                  background: `#${usersInvolved.loader &&
                    md5(usersInvolved.loader?.username).substring(0, 6)}`
                }}
              >
                {usersInvolved.loader?.firstName[0]?.toUpperCase()}
                {usersInvolved.loader?.lastName[0]?.toUpperCase()}
              </Avatar>
            </ResponsableCol>
            <ResponsableCol>
              <Paragraph strong>
                {usersInvolved.loader?.firstName} {usersInvolved.loader?.lastName}
              </Paragraph>
              <Tag size="small" color="blue">
                Cargador
              </Tag>
              <Paragraph type="secondary">Cargado el {moment(load).format('LLL')}</Paragraph>
            </ResponsableCol>
          </ResponsableBlock>
        </Item>
        <Item>
          <ResponsableBlock>
            <ResponsableCol>
              <Avatar
                style={{
                  marginRight: 10,
                  background: `#${usersInvolved.cashier &&
                    md5(usersInvolved.cashier?.username).substring(0, 6)}`
                }}
              >
                {usersInvolved.cashier?.firstName[0]?.toUpperCase()}
                {usersInvolved.cashier?.lastName[0]?.toUpperCase()}
              </Avatar>
            </ResponsableCol>
            <ResponsableCol>
              <Paragraph strong>
                {usersInvolved.cashier?.firstName} {usersInvolved.cashier?.lastName}
              </Paragraph>
              <Tag size="small" color="blue">
                Cajero
              </Tag>
              <Paragraph type="secondary">Cobrado el {moment(out).format('LLL')}</Paragraph>
            </ResponsableCol>
          </ResponsableBlock>
        </Item>
      </Timeline>
    </Container>
  );
};

EventsTimeLine.propTypes = {
  usersInvolved: PropTypes.shape({
    guard: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string
    }),
    loader: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string
    }),
    cashier: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string
    })
  }).isRequired,
  in: PropTypes.any.isRequired,
  load: PropTypes.any.isRequired,
  out: PropTypes.any.isRequired
};

export default EventsTimeLine;
