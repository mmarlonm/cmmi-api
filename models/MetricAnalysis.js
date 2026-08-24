const mongoose = require('mongoose');

const MetricAnalysisSchema = new mongoose.Schema({
  sprintId: {
    type: String,
    required: true,
    index: true
  },
  sprintName: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  aiAnalysis: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Composite index to enforce unique version per sprint
MetricAnalysisSchema.index({ sprintId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('MetricAnalysis', MetricAnalysisSchema);
