const express = require('express');
const router = express.Router();
const SprintProcessData = require('../models/SprintProcessData');
const PreAnalysis = require('../models/PreAnalysis');

// @route   POST /api/process/:sprintId
// @desc    Save/Upsert complete process data for a sprint in MongoDB
router.post('/:sprintId', async (req, res) => {
  try {
    const { sprintId } = req.params;
    const {
      sprintName,
      sprintAnalysisNotes,
      itemAnalysesMap,
      minutaRiesgos,
      evidences,
      saaoMacroTasks,
      isFullyCertified
    } = req.body;

    const processData = await SprintProcessData.findOneAndUpdate(
      { sprintId },
      {
        sprintId,
        sprintName: sprintName || '',
        sprintAnalysisNotes: sprintAnalysisNotes || '',
        itemAnalysesMap: itemAnalysesMap || {},
        minutaRiesgos: minutaRiesgos || {},
        evidences: evidences || {},
        saaoMacroTasks: saaoMacroTasks || [],
        isFullyCertified: !!isFullyCertified
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(processData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/process/:sprintId
// @desc    Get process data for a sprint from MongoDB
router.get('/:sprintId', async (req, res) => {
  try {
    const processData = await SprintProcessData.findOne({ sprintId: req.params.sprintId });
    if (!processData) {
      return res.status(404).json({ message: 'No process data found for this sprint' });
    }
    return res.json(processData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/process/pre-analysis
// @desc    Save or bulk upsert manual pre-analyses in MongoDB
router.post('/pre-analysis', async (req, res) => {
  try {
    const { preAnalyses, itemId, type, title, estimatedHours, assignedIsw, notes } = req.body;

    if (Array.isArray(preAnalyses)) {
      const ops = preAnalyses.map(p => ({
        updateOne: {
          filter: { itemId: p.itemId },
          update: { $set: p },
          upsert: true
        }
      }));
      await PreAnalysis.bulkWrite(ops);
      const all = await PreAnalysis.find().sort({ createdAt: -1 });
      return res.json(all);
    }

    if (!itemId || !title) {
      return res.status(400).json({ error: 'itemId and title are required' });
    }

    const updated = await PreAnalysis.findOneAndUpdate(
      { itemId },
      { itemId, type, title, estimatedHours, assignedIsw, notes },
      { new: true, upsert: true }
    );

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/process/pre-analyses
// @desc    Get all manual pre-analyses from MongoDB
router.get('/pre-analyses', async (req, res) => {
  try {
    const list = await PreAnalysis.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
