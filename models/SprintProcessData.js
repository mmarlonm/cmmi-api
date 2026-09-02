const mongoose = require('mongoose');

const SprintProcessDataSchema = new mongoose.Schema({
  sprintId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  sprintName: {
    type: String,
    default: ''
  },
  sprintAnalysisNotes: {
    type: String,
    default: ''
  },
  itemAnalysesMap: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  minutaRiesgos: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  evidences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  saaoMacroTasks: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  isFullyCertified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SprintProcessData', SprintProcessDataSchema);
