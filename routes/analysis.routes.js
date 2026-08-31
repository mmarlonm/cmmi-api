const express = require('express');
const router = express.Router();
const MetricAnalysis = require('../models/MetricAnalysis');

// @route   POST /api/analysis
// @desc    Save/Upsert metrics analysis for a specific sprint (no versions, overwrite existing)
router.post('/', async (req, res) => {
  try {
    const { sprintId, sprintName, metrics, aiAnalysis, metricAnalyses, metricComments } = req.body;

    if (!sprintId || !sprintName || !metrics) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedAnalysis = await MetricAnalysis.findOneAndUpdate(
      { sprintId },
      {
        sprintId,
        sprintName,
        version: 1,
        metrics,
        aiAnalysis: aiAnalysis || "",
        metricAnalyses: metricAnalyses || {},
        metricComments: metricComments || {},
        isActive: true
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(updatedAnalysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/sprint/:sprintId
// @desc    Get the latest active analysis for a specific sprint
router.get('/sprint/:sprintId', async (req, res) => {
  try {
    const analysis = await MetricAnalysis.findOne({ sprintId: req.params.sprintId });
    if (!analysis) {
      return res.status(404).json({ message: 'No analysis found for this sprint' });
    }
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analysis/sprint/:sprintId/versions
// @desc    Get all versions history list for a sprint (now returns single item representing the active sprint)
router.get('/sprint/:sprintId/versions', async (req, res) => {
  try {
    const analysis = await MetricAnalysis.findOne({ sprintId: req.params.sprintId });
    if (!analysis) {
      return res.json([]);
    }
    return res.json([{
      version: 1,
      isActive: true,
      createdAt: analysis.createdAt
    }]);
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
