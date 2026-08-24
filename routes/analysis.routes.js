const express = require('express');
const router = express.Router();
const MetricAnalysis = require('../models/MetricAnalysis');

// @route   POST /api/analysis
// @desc    Save new analysis or create a new version of metrics analysis
router.post('/', async (req, res) => {
  try {
    const { sprintId, sprintName, metrics, aiAnalysis, metricAnalyses } = req.body;

    if (!sprintId || !sprintName || !metrics || !aiAnalysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Deactivate previous active analyses for this sprint
    await MetricAnalysis.updateMany({ sprintId, isActive: true }, { isActive: false });

    // Determine the next version number
    const lastEntry = await MetricAnalysis.findOne({ sprintId }).sort({ version: -1 });
    const nextVersion = lastEntry ? lastEntry.version + 1 : 1;

    const newAnalysis = new MetricAnalysis({
      sprintId,
      sprintName,
      version: nextVersion,
      metrics,
      aiAnalysis,
      metricAnalyses: metricAnalyses || {},
      isActive: true
    });

    await newAnalysis.save();
    return res.status(201).json(newAnalysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/sprint/:sprintId
// @desc    Get the latest active analysis for a specific sprint
router.get('/sprint/:sprintId', async (req, res) => {
  try {
    const analysis = await MetricAnalysis.findOne({ sprintId: req.params.sprintId, isActive: true });
    if (!analysis) {
      return res.status(404).json({ message: 'No analysis found for this sprint' });
    }
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/sprint/:sprintId/versions
// @desc    Get all versions history list for a sprint
router.get('/sprint/:sprintId/versions', async (req, res) => {
  try {
    const history = await MetricAnalysis.find({ sprintId: req.params.sprintId })
      .select('version isActive createdAt')
      .sort({ version: -1 });
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/version/:sprintId/:versionNum
// @desc    Get a specific version analysis of a sprint
router.get('/version/:sprintId/:versionNum', async (req, res) => {
  try {
    const analysis = await MetricAnalysis.findOne({
      sprintId: req.params.sprintId,
      version: parseInt(req.params.versionNum, 10)
    });
    if (!analysis) {
      return res.status(404).json({ message: 'Specific version not found' });
    }
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/analysis/restore/:id
// @desc    Restore/Activate a specific analysis version as active
router.post('/restore/:id', async (req, res) => {
  try {
    const target = await MetricAnalysis.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Deactivate others
    await MetricAnalysis.updateMany({ sprintId: target.sprintId }, { isActive: false });

    // Activate this one
    target.isActive = true;
    await target.save();

    return res.json(target);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/all-sprints
// @desc    Get latest active analysis for every sprint stored in DB (for trend comparison)
router.get('/all-sprints', async (req, res) => {
  try {
    const analyses = await MetricAnalysis.find({ isActive: true })
      .select('sprintId sprintName version metrics metricAnalyses createdAt')
      .sort({ createdAt: 1 });
    return res.json(analyses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
