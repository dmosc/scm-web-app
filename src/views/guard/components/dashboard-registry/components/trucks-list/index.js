import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {List} from 'antd';
import {GET_TICKETS} from './graphql/queries';
import {ListContainer} from './elements';

class TrucksList extends Component {
  state = {
    loadingTrucks: false,
    tickets: [],
  };

  componentDidMount = async () => {
    const {client} = this.props;
    this.setState({loadingTrucks: true});

    try {
      const {
        data: {tickets},
      } = await client.query({
        query: GET_TICKETS,
        variables: {
          filters: {},
        },
      });

      if (!tickets) throw new Error('No tickets found');

      this.setState({loadingTrucks: false, tickets});
    } catch (e) {
      this.setState({loadingTrucks: false});
    }
  };

  render() {
    const {loadingTrucks, tickets} = this.state;

    return (
      <ListContainer>
        <List
          loading={loadingTrucks}
          itemLayout="horizontal"
          dataSource={tickets}
          size="small"
          renderItem={ticket => (
            <List.Item>
              <List.Item.Meta
                title={`${ticket.truck.plates} : ${ticket.product.name}`}
                description={`${ticket.client.businessName}`}
              />
            </List.Item>
          )}
        />
      </ListContainer>
    );
  }
}

export default withApollo(TrucksList);
