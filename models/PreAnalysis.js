const mongoose = require('mongoose');

const PreAnalysisSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['User Story', 'Feature', 'Bug Sprint', 'Bug Kanban'],
    default: 'User Story'
  },
  title: {
    type: String,
    required: true
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  assignedIsw: {
    type: String,
    default: 'Marlon'
  },
  notes: {
    type: String,
    default: ''
  },
  isLinkedToAzure: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PreAnalysis', PreAnalysisSchema);
