const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockIn = sequelize.define('StockIn', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spare_part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spare_parts',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  stock_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_in',
  timestamps: true
});

module.exports = StockIn;
