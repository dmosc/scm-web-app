import React, {Component} from 'react';
import {Form, Drawer, Row, Col, Input, List, Button, Icon} from 'antd';
import ListContainer from "components/common/list";
import EditForm from './components/client-edit-form';
import {TitleList, TitleContainer} from './elements';

const {Search} = Input;

class ClientList extends Component {
  state = {
    currentClient: null,
  };

  setCurrentClient = currentClient => this.setState({currentClient});

  render() {
    const {visible, loadingClients, clients, handleFilterChange, toggleList, onClientEdit} = this.props;
    const {currentClient} = this.state;

    const ClientEditForm = Form.create({name: 'clientEdit'})(EditForm);

    return (
      <React.Fragment>
        <Drawer
          placement="right"
          closable={false}
          onClose={() => toggleList()}
          visible={visible}
          getContainer={false}
          style={{position: 'absolute', minHeight: 1000}}
          maskStyle={{backgroundColor: 'transparent'}}
          bodyStyle={{margin: 0, padding: 0}}
          width="100%"
        >
            <Row>
                <TitleContainer>
                    <TitleList>Lista de clientes</TitleList>
                    <Button type="link" onClick={() => toggleList()}>
                        Regresar
                    </Button>
                </TitleContainer>
            </Row>
            <Row>
                <Col span={12}>
                    <Search
                        style={{width: 250}}
                        allowClear
                        placeholder="Buscar clientes"
                        onChange={({target: {value}}) => handleFilterChange('search', value)}
                    />
                </Col>
            </Row>
            <ListContainer height="40vh">
              <List
                loading={loadingClients}
                itemLayout="horizontal"
                dataSource={clients}
                size="small"
                renderItem={client => (
                  <List.Item
                    actions={[
                      <Icon
                        type="edit"
                        onClick={() => this.setCurrentClient(client)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      title={`${client.businessName}`}
                      description={`${client.lastName} ${client.firstName}`.trim()}
                    />
                  </List.Item>
                )}
              />
            </ListContainer>
        </Drawer>
        {currentClient && (
          <ClientEditForm
            onClientEdit={onClientEdit}
            setCurrentClient={this.setCurrentClient}
            currentClient={currentClient}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ClientList;
