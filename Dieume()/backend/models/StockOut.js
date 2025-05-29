const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockOut = sequelize.define('StockOut', {
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
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  stock_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_out',
  timestamps: true,
  hooks: {
    beforeSave: (stockOut) => {
      // Calculate total_price if not provided
      if (stockOut.quantity && stockOut.unit_price) {
        stockOut.total_price = stockOut.quantity * stockOut.unit_price;
      }
    }
  }
});

module.exports = StockOut;
