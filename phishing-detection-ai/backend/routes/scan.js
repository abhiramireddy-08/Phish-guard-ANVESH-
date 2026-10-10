const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ─── Validation Schemas ───────────────────────────────────────────────────────
const urlSchema = Joi.object({
  url: Joi.string().uri().required().max(2048),
});

const emailSchema = Joi.object({
  subject: Joi.string().required().max(500),
  sender: Joi.string().email().required(),
  body: Joi.string().required().max(50000),
  headers: Joi.object().optional(),
});

const batchSchema = Joi.object({
  urls: Joi.array().items(Joi.string().uri()).max(100).optional(),
  emails: Joi.array().items(emailSchema).max(50).optional(),
}).or('urls', 'emails');

// ─── POST /api/scan/url ───────────────────────────────────────────────────────
router.post('/url', async (req, res, next) => {
  try {
    const { error, value } = urlSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const scanId = uuidv4();
    const response = await axios.post(`${ML_SERVICE_URL}/predict/url`, {
      url: value.url,
      scan_id: scanId,
    });

    const result = {
      scan_id: scanId,
      url: value.url,
      ...response.data,
      scanned_at: new Date().toISOString(),
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/scan/email ─────────────────────────────────────────────────────
router.post('/email', async (req, res, next) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const scanId = uuidv4();
    const response = await axios.post(`${ML_SERVICE_URL}/predict/email`, {
      ...value,
      scan_id: scanId,
    });

    res.json({
      scan_id: scanId,
      ...response.data,
      scanned_at: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/scan/batch ─────────────────────────────────────────────────────
router.post('/batch', async (req, res, next) => {
  try {
    const { error, value } = batchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const batchId = uuidv4();
    const response = await axios.post(`${ML_SERVICE_URL}/predict/batch`, {
      ...value,
      batch_id: batchId,
    });

    res.json({
      batch_id: batchId,
      total: (value.urls?.length || 0) + (value.emails?.length || 0),
      results: response.data.results,
      scanned_at: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
