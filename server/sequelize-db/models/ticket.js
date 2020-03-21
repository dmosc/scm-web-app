import Sequelize from 'sequelize';
import sequelize from '../index';

const Ticket = sequelize.define('Ticket', {
  folio: { type: Sequelize.STRING, unique: true, allowNull: false },
  driver: { type: Sequelize.STRING, allowNull: false },
  client: { type: Sequelize.STRING, allowNull: false },
  businessName: { type: Sequelize.STRING, allowNull: false },
  address: { type: Sequelize.STRING, allowNull: false },
  rfc: { type: Sequelize.STRING, allowNull: false },
  plates: { type: Sequelize.STRING, allowNull: false },
  truckWeight: { type: Sequelize.FLOAT, allowNull: false },
  totalWeight: { type: Sequelize.FLOAT, allowNull: false },
  tons: { type: Sequelize.FLOAT, allowNull: false },
  product: { type: Sequelize.STRING, allowNull: false },
  price: { type: Sequelize.FLOAT, allowNull: false },
  tax: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
  total: { type: Sequelize.FLOAT, allowNull: false },
  inTruckImage: { type: Sequelize.STRING, allowNull: true },
  outTruckImage: { type: Sequelize.STRING, allowNull: true }
});

export default Ticket;
