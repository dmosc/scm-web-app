import React, {Component} from 'react';
import {Form, Drawer, List, Button, Icon} from 'antd';
import EditForm from './components/user-edit-form';
import {TitleList, TitleContainer} from './elements';

class UserList extends Component {
  state = {
    currentUser: null,
  };

  setCurrentUser = currentUser => this.setState({currentUser});

  render() {
    const {loadingUsers, users, visible, toggleList, onUserEdit} = this.props;
    const {currentUser} = this.state;

    const UserEditForm = Form.create({name: 'userEdit'})(EditForm);

    return (
      <React.Fragment>
        <Drawer
          closable={false}
          onClose={() => toggleList()}
          visible={visible}
          getContainer={false}
          style={{position: 'absolute'}}
          maskStyle={{backgroundColor: 'transparent'}}
          bodyStyle={{margin: 0, padding: 0}}
          width="100%"
        >
          <TitleContainer>
            <TitleList>Lista de usuarios</TitleList>
            <Button type="link" onClick={() => toggleList()}>
              Regresar
            </Button>
          </TitleContainer>
          <List
            loading={loadingUsers}
            itemLayout="horizontal"
            dataSource={users}
            size="small"
            renderItem={user => (
              <List.Item
                actions={[
                  <Icon
                    type="edit"
                    onClick={() => this.setCurrentUser(user)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={`${user.username}`}
                  description={`${user.firstName} ${user.lastName}`}
                />
              </List.Item>
            )}
          />
        </Drawer>
        {currentUser && (
          <UserEditForm
            users={users}
            onUserEdit={onUserEdit}
            setCurrentUser={this.setCurrentUser}
            currentUser={currentUser}
          />
        )}
      </React.Fragment>
    );
  }
}

export default UserList;
