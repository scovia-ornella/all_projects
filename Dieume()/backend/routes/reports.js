const express = require('express');
const { Op } = require('sequelize');
const { StockOut, StockIn, SparePart, sequelize } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Daily Stock Out Report
router.get('/daily-stock-out', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    const stockOuts = await StockOut.findAll({
      where: {
        stock_out_date: date
      },
      include: [{
        model: SparePart,
        as: 'sparePart',
        attributes: ['name', 'category']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Calculate totals
    const totalQuantity = stockOuts.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = stockOuts.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    res.json({
      success: true,
      data: {
        date,
        stockOuts,
        summary: {
          totalEntries: stockOuts.length,
          totalQuantity,
          totalValue: totalValue.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Daily stock out report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Daily Stock Status Report
router.get('/daily-stock-status', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    // Get all spare parts with their stock movements up to the specified date
    const spareParts = await SparePart.findAll({
      attributes: ['id', 'name', 'category', 'quantity'],
      include: [
        {
          model: StockIn,
          as: 'stockIns',
          where: {
            stock_in_date: {
              [Op.lte]: date
            }
          },
          required: false,
          attributes: ['quantity']
        },
        {
          model: StockOut,
          as: 'stockOuts',
          where: {
            stock_out_date: {
              [Op.lte]: date
            }
          },
          required: false,
          attributes: ['quantity']
        }
      ]
    });

    const stockStatus = spareParts.map(sparePart => {
      const totalStockIn = sparePart.stockIns.reduce((sum, stockIn) => sum + stockIn.quantity, 0);
      const totalStockOut = sparePart.stockOuts.reduce((sum, stockOut) => sum + stockOut.quantity, 0);
      const remainingQuantity = totalStockIn - totalStockOut;

      return {
        id: sparePart.id,
        name: sparePart.name,
        category: sparePart.category,
        totalStockIn,
        totalStockOut,
        remainingQuantity,
        currentStock: sparePart.quantity
      };
    });

    // Calculate overall summary
    const summary = {
      totalSpareParts: stockStatus.length,
      totalStockIn: stockStatus.reduce((sum, item) => sum + item.totalStockIn, 0),
      totalStockOut: stockStatus.reduce((sum, item) => sum + item.totalStockOut, 0),
      totalRemainingQuantity: stockStatus.reduce((sum, item) => sum + item.remainingQuantity, 0)
    };

    res.json({
      success: true,
      data: {
        date,
        stockStatus,
        summary
      }
    });
  } catch (error) {
    console.error('Daily stock status report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Stock Movement Summary (Additional useful report)
router.get('/stock-movement-summary', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate parameters are required (YYYY-MM-DD format)'
      });
    }

    // Get stock in entries for the period
    const stockInEntries = await StockIn.findAll({
      where: {
        stock_in_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: SparePart,
        as: 'sparePart',
        attributes: ['name', 'category']
      }],
      order: [['stock_in_date', 'DESC']]
    });

    // Get stock out entries for the period
    const stockOutEntries = await StockOut.findAll({
      where: {
        stock_out_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: SparePart,
        as: 'sparePart',
        attributes: ['name', 'category']
      }],
      order: [['stock_out_date', 'DESC']]
    });

    // Process stock in summary
    const stockInSummary = {};
    stockInEntries.forEach(entry => {
      const partId = entry.spare_part_id;
      if (!stockInSummary[partId]) {
        stockInSummary[partId] = {
          sparePart: entry.sparePart,
          totalQuantity: 0,
          totalEntries: 0
        };
      }
      stockInSummary[partId].totalQuantity += entry.quantity;
      stockInSummary[partId].totalEntries += 1;
    });

    // Process stock out summary
    const stockOutSummary = {};
    stockOutEntries.forEach(entry => {
      const partId = entry.spare_part_id;
      if (!stockOutSummary[partId]) {
        stockOutSummary[partId] = {
          sparePart: entry.sparePart,
          totalQuantity: 0,
          totalValue: 0,
          totalEntries: 0
        };
      }
      stockOutSummary[partId].totalQuantity += entry.quantity;
      stockOutSummary[partId].totalValue += parseFloat(entry.total_price);
      stockOutSummary[partId].totalEntries += 1;
    });

    // Convert to arrays
    const stockInSummaryArray = Object.values(stockInSummary);
    const stockOutSummaryArray = Object.values(stockOutSummary);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        stockInSummary: stockInSummaryArray,
        stockOutSummary: stockOutSummaryArray
      }
    });
  } catch (error) {
    console.error('Stock movement summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
