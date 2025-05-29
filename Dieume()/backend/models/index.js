const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const SparePart = require('./SparePart');
const StockIn = require('./StockIn');
const StockOut = require('./StockOut');

// Define associations
SparePart.hasMany(StockIn, {
  foreignKey: 'spare_part_id',
  as: 'stockIns'
});

StockIn.belongsTo(SparePart, {
  foreignKey: 'spare_part_id',
  as: 'sparePart'
});

SparePart.hasMany(StockOut, {
  foreignKey: 'spare_part_id',
  as: 'stockOuts'
});

StockOut.belongsTo(SparePart, {
  foreignKey: 'spare_part_id',
  as: 'sparePart'
});

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');

    // Create default admin user if it doesn't exist
    const adminExists = await User.findByUsername('admin');
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123'
      });
      console.log('Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  SparePart,
  StockIn,
  StockOut,
  syncDatabase
};
