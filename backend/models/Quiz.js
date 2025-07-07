import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['mcq', 'short_answer'],
    required: true
  },
  options: {
    A: String,
    B: String,
    C: String,
    D: String
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required']
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1']
  },
  timeLimit: {
    type: Number,
    default: 60, // seconds
    min: [10, 'Time limit must be at least 10 seconds']
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Quiz name is required'],
    trim: true,
    maxlength: [100, 'Quiz name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowRetake: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: [1, 'Max attempts must be at least 1']
    },
    passingScore: {
      type: Number,
      default: 60,
      min: [0, 'Passing score must be at least 0'],
      max: [100, 'Passing score cannot exceed 100']
    }
  },
  session: {
    isLive: {
      type: Boolean,
      default: false
    },
    startTime: Date,
    endTime: Date,
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ groupId: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ 'session.isLive': 1 });

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  next();
});

// Start live session
quizSchema.methods.startSession = async function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft quizzes can be started');
  }
  
  this.status = 'active';
  this.session.isLive = true;
  this.session.startTime = new Date();
  this.session.currentQuestionIndex = 0;
  
  return await this.save();
};

// End live session
quizSchema.methods.endSession = async function() {
  if (!this.session.isLive) {
    throw new Error('No active session to end');
  }
  
  this.status = 'completed';
  this.session.isLive = false;
  this.session.endTime = new Date();
  
  return await this.save();
};

// Add participant to session
quizSchema.methods.addParticipant = async function(userId) {
  if (!this.session.isLive) {
    throw new Error('No active session');
  }
  
  const existingParticipant = this.session.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    return this;
  }
  
  this.session.participants.push({
    userId,
    joinedAt: new Date(),
    score: 0,
    completed: false
  });
  
  return await this.save();
};

// Update participant score
quizSchema.methods.updateParticipantScore = async function(userId, score) {
  const participant = this.session.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (participant) {
    participant.score = score;
    participant.completed = true;
    return await this.save();
  }
  
  throw new Error('Participant not found');
};

// Get current question
quizSchema.methods.getCurrentQuestion = function() {
  if (this.session.currentQuestionIndex >= this.questions.length) {
    return null;
  }
  return this.questions[this.session.currentQuestionIndex];
};

// Move to next question
quizSchema.methods.nextQuestion = async function() {
  if (this.session.currentQuestionIndex < this.questions.length - 1) {
    this.session.currentQuestionIndex++;
    return await this.save();
  }
  return this;
};

// Get leaderboard
quizSchema.methods.getLeaderboard = function() {
  return this.session.participants
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 