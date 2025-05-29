const express = require('express');
const { body, validationResult } = require('express-validator');
const { SparePart } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create spare part (INSERT only)
router.post('/',
  requireAuth,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Spare part name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    body('unit_price')
      .isFloat({ min: 0 })
      .withMessage('Unit price must be a non-negative number')
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

      const { name, category, quantity, unit_price } = req.body;

      // Check if spare part with same name already exists
      const existingSparePart = await SparePart.findOne({ where: { name } });
      if (existingSparePart) {
        return res.status(400).json({
          success: false,
          message: 'A spare part with this name already exists'
        });
      }

      // Create spare part
      const sparePart = await SparePart.create({
        name,
        category,
        quantity,
        unit_price,
        total_price: quantity * unit_price
      });

      res.status(201).json({
        success: true,
        message: 'Spare part created successfully',
        data: sparePart
      });
    } catch (error) {
      console.error('Create spare part error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get all spare parts (for dropdown selections)
router.get('/', requireAuth, async (req, res) => {
  try {
    const spareParts = await SparePart.findAll({
      attributes: ['id', 'name', 'category', 'quantity', 'unit_price'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: spareParts
    });
  } catch (error) {
    console.error('Get spare parts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
