const express = require('express');
const { body, validationResult } = require('express-validator');
const { StockIn, SparePart } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all stock in entries (READ)
router.get('/', requireAuth, async (req, res) => {
  try {
    const stockIns = await StockIn.findAll({
      include: [{
        model: SparePart,
        as: 'sparePart',
        attributes: ['name', 'category']
      }],
      order: [['stock_in_date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: stockIns
    });
  } catch (error) {
    console.error('Get stock in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create stock in entry (INSERT only)
router.post('/',
  requireAuth,
  [
    body('spare_part_id')
      .isInt({ min: 1 })
      .withMessage('Valid spare part ID is required'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('stock_in_date')
      .optional()
      .isDate()
      .withMessage('Stock in date must be a valid date')
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

      const { spare_part_id, quantity, stock_in_date } = req.body;

      // Check if spare part exists
      const sparePart = await SparePart.findByPk(spare_part_id);
      if (!sparePart) {
        return res.status(404).json({
          success: false,
          message: 'Spare part not found'
        });
      }

      // Create stock in entry
      const stockIn = await StockIn.create({
        spare_part_id,
        quantity,
        stock_in_date: stock_in_date || new Date()
      });

      // Update spare part quantity
      await sparePart.update({
        quantity: sparePart.quantity + quantity
      });

      // Fetch the created stock in with spare part details
      const stockInWithDetails = await StockIn.findByPk(stockIn.id, {
        include: [{
          model: SparePart,
          as: 'sparePart',
          attributes: ['name', 'category']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Stock in entry created successfully',
        data: stockInWithDetails
      });
    } catch (error) {
      console.error('Create stock in error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
