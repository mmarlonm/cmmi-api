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
    default: ""
  },
  // Individual metric analyses stored by key (e.g. 'densidad de defectos', 'eed', etc.)
  metricAnalyses: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // User comments/context captured manually per metric
  metricComments: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

