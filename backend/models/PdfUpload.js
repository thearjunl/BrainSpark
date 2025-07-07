import mongoose from 'mongoose';

const pdfUploadSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  fileName: {
    type: String,
    required: [true, 'Stored filename is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: true,
    min: [0, 'File size cannot be negative']
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  extractedText: {
    type: String,
    default: ''
  },
  textLength: {
    type: Number,
    default: 0
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String,
    default: ''
  },
  generatedQuestions: [{
    questionText: String,
    type: {
      type: String,
      enum: ['mcq', 'short_answer']
    },
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: String
  }],
  metadata: {
    pageCount: {
      type: Number,
      default: 0
    },
    subject: {
      type: String,
      default: ''
    },
    keywords: [String],
    language: {
      type: String,
      default: 'en'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
pdfUploadSchema.index({ uploadedBy: 1 });
pdfUploadSchema.index({ groupId: 1 });
pdfUploadSchema.index({ processingStatus: 1 });
pdfUploadSchema.index({ createdAt: -1 });

// Calculate text length before saving
pdfUploadSchema.pre('save', function(next) {
  if (this.extractedText) {
    this.textLength = this.extractedText.length;
  }
  next();
});

// Get uploads by group
pdfUploadSchema.statics.getByGroup = async function(groupId, limit = 10) {
  return await this.find({ 
    groupId, 
    isActive: true 
  })
  .populate('uploadedBy', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Get uploads by user
pdfUploadSchema.statics.getByUser = async function(userId, limit = 20) {
  return await this.find({ 
    uploadedBy: userId, 
    isActive: true 
  })
  .populate('groupId', 'name code')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Get processing statistics
pdfUploadSchema.statics.getProcessingStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$processingStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

// Update processing status
pdfUploadSchema.methods.updateProcessingStatus = async function(status, error = '') {
  this.processingStatus = status;
  if (error) {
    this.processingError = error;
  }
  return await this.save();
};

// Add generated questions
pdfUploadSchema.methods.addGeneratedQuestions = async function(questions) {
  this.generatedQuestions = questions;
  this.processingStatus = 'completed';
  return await this.save();
};

const PdfUpload = mongoose.model('PdfUpload', pdfUploadSchema);

export default PdfUpload; 