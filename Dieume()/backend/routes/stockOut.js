const express = require('express');
const { body, validationResult } = require('express-validator');
const { StockOut, SparePart } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all stock out entries (READ)
router.get('/', requireAuth, async (req, res) => {
  try {
    const stockOuts = await StockOut.findAll({
      include: [{
        model: SparePart,
        as: 'sparePart',
        attributes: ['name', 'category']
      }],
      order: [['stock_out_date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: stockOuts
    });
  } catch (error) {
    console.error('Get stock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create stock out entry (CREATE)
router.post('/',
  requireAuth,
  [
    body('spare_part_id')
      .isInt({ min: 1 })
      .withMessage('Valid spare part ID is required'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('unit_price')
      .isFloat({ min: 0 })
      .withMessage('Unit price must be a non-negative number'),
    body('stock_out_date')
      .optional()
      .isDate()
      .withMessage('Stock out date must be a valid date')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { spare_part_id, quantity, unit_price, stock_out_date } = req.body;

      // Check if spare part exists and has sufficient quantity
      const sparePart = await SparePart.findByPk(spare_part_id);
      if (!sparePart) {
        return res.status(404).json({
          success: false,
          message: 'Spare part not found'
        });
      }

      if (sparePart.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available quantity: ${sparePart.quantity}`
        });
      }

      // Create stock out entry
      const stockOut = await StockOut.create({
        spare_part_id,
        quantity,
        unit_price,
        total_price: quantity * unit_price,
        stock_out_date: stock_out_date || new Date()
      });

      // Update spare part quantity
      await sparePart.update({
        quantity: sparePart.quantity - quantity
      });

      // Fetch the created stock out with spare part details
      const stockOutWithDetails = await StockOut.findByPk(stockOut.id, {
        include: [{
          model: SparePart,
          as: 'sparePart',
          attributes: ['name', 'category']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Stock out entry created successfully',
        data: stockOutWithDetails
      });
    } catch (error) {
      console.error('Create stock out error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Update stock out entry (UPDATE)
router.put('/:id',
  requireAuth,
  [
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('unit_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Unit price must be a non-negative number'),
    body('stock_out_date')
      .optional()
      .isDate()
      .withMessage('Stock out date must be a valid date')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { quantity, unit_price, stock_out_date } = req.body;

      // Find the stock out entry
      const stockOut = await StockOut.findByPk(id, {
        include: [{
          model: SparePart,
          as: 'sparePart'
        }]
      });

      if (!stockOut) {
        return res.status(404).json({
          success: false,
          message: 'Stock out entry not found'
        });
      }

      const oldQuantity = stockOut.quantity;
      const newQuantity = quantity || oldQuantity;
      const quantityDifference = newQuantity - oldQuantity;

      // Check if spare part has sufficient quantity for the update
      if (quantityDifference > 0 && stockOut.sparePart.quantity < quantityDifference) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for update. Available quantity: ${stockOut.sparePart.quantity}`
        });
      }

      // Update stock out entry
      const updateData = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (unit_price !== undefined) updateData.unit_price = unit_price;
      if (stock_out_date !== undefined) updateData.stock_out_date = stock_out_date;
      
      // Recalculate total_price if quantity or unit_price changed
      if (quantity !== undefined || unit_price !== undefined) {
        updateData.total_price = (quantity || stockOut.quantity) * (unit_price || stockOut.unit_price);
      }

      await stockOut.update(updateData);

      // Update spare part quantity
      if (quantityDifference !== 0) {
        await stockOut.sparePart.update({
          quantity: stockOut.sparePart.quantity - quantityDifference
        });
      }

      // Fetch updated stock out with spare part details
      const updatedStockOut = await StockOut.findByPk(id, {
        include: [{
          model: SparePart,
          as: 'sparePart',
          attributes: ['name', 'category']
        }]
      });

      res.json({
        success: true,
        message: 'Stock out entry updated successfully',
        data: updatedStockOut
      });
    } catch (error) {
      console.error('Update stock out error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Delete stock out entry (DELETE)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the stock out entry
    const stockOut = await StockOut.findByPk(id, {
      include: [{
        model: SparePart,
        as: 'sparePart'
      }]
    });

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: 'Stock out entry not found'
      });
    }

    // Restore quantity to spare part
    await stockOut.sparePart.update({
      quantity: stockOut.sparePart.quantity + stockOut.quantity
    });

    // Delete the stock out entry
    await stockOut.destroy();

    res.json({
      success: true,
      message: 'Stock out entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete stock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
