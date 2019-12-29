import React, {Component} from 'react';
import {Form, Drawer, List, Button, Icon} from 'antd';
import EditForm from './components/client-edit-form';
import {TitleList, TitleContainer} from './elements';

class ClientList extends Component {
  state = {
    currentClient: null,
  };

  setCurrentClient = currentClient => this.setState({currentClient});

  render() {
    const {
      visible,
      loadingClients,
      clients,
      onClientEdit,
      toggleList,
    } = this.props;
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
          <TitleContainer>
            <TitleList>Lista de clientes</TitleList>
            <Button type="link" onClick={() => toggleList()}>
              Regresar
            </Button>
          </TitleContainer>
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
                  description={`${client.lastName}, ${client.firstName}`}
                />
              </List.Item>
            )}
          />
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
