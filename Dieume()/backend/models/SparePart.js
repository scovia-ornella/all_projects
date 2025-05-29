const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SparePart = sequelize.define('SparePart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
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
  }
}, {
  tableName: 'spare_parts',
  timestamps: true,
  hooks: {
    beforeSave: (sparePart) => {
      // Calculate total_price if not provided
      if (sparePart.quantity && sparePart.unit_price) {
        sparePart.total_price = sparePart.quantity * sparePart.unit_price;
      }
    }
  }
});

module.exports = SparePart;
