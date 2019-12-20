import React, {Component} from 'react';
import {Drawer, List, Button, Icon} from 'antd';
import {TitleList, TitleContainer} from './elements';

class TruckList extends Component {
  state = {
    currentTruck: null,
  };

  setCurrentTruck = currentTruck => this.setState({currentTruck});

  render() {
    const {loadingTrucks, trucks, visible, toggleList} = this.props;
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
            <TitleList>Lista de camiones</TitleList>
            <Button type="link" onClick={() => toggleList()}>
              Regresar
            </Button>
          </TitleContainer>
          <List
            loading={loadingTrucks}
            itemLayout="horizontal"
            dataSource={trucks}
            size="small"
            renderItem={truck => (
              <List.Item
                actions={[
                  <Icon
                    type="edit"
                    onClick={() => this.setCurrentTruck(truck)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={`${truck.plates}`}
                  description={`${truck.drivers.join(', ')},`}
                />
              </List.Item>
            )}
          />
        </Drawer>
      </React.Fragment>
    );
  }
}

export default TruckList;
