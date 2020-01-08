import React, {Component} from 'react';
import {Form, Drawer, Row, Col, Input, List, Button, Icon} from 'antd';
import EditForm from './components/truck-edit-form';
import {TitleList, TitleContainer} from './elements';

const {Search} = Input;

class TruckList extends Component {
  state = {
    currentTruck: null,
  };

  setCurrentTruck = currentTruck => this.setState({currentTruck});

  render() {
    const {loadingTrucks, trucks, handleFilterChange, visible, toggleList, onTruckEdit} = this.props;
    const {currentTruck} = this.state;

    const TruckEditForm = Form.create({name: 'truckEdit'})(EditForm);

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
            <Row>
                <TitleContainer>
                    <TitleList>Lista de camiones</TitleList>
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
                        placeholder="Buscar camiones"
                        onChange={({target: {value}}) => handleFilterChange('search', value)}
                    />
                </Col>
            </Row>
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
        {currentTruck && (
          <TruckEditForm
            trucks={trucks}
            onTruckEdit={onTruckEdit}
            setCurrentTruck={this.setCurrentTruck}
            currentTruck={currentTruck}
          />
        )}
      </React.Fragment>
    );
  }
}

export default TruckList;
