import mongoose from 'mongoose';

const studentAnswerSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerText: {
    type: String,
    required: [true, 'Answer text is required'],
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  timeTaken: {
    type: Number, // seconds
    default: 0,
    min: [0, 'Time taken cannot be negative']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: [1, 'Attempt number must be at least 1']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studentAnswerSchema.index({ quizId: 1, userId: 1 });
studentAnswerSchema.index({ questionId: 1 });
studentAnswerSchema.index({ userId: 1 });
studentAnswerSchema.index({ submittedAt: -1 });

// Compound index for unique answers per attempt
studentAnswerSchema.index(
  { quizId: 1, questionId: 1, userId: 1, attemptNumber: 1 },
  { unique: true }
);

// Calculate points earned based on correctness and time
studentAnswerSchema.methods.calculatePoints = function(questionPoints, timeLimit) {
  if (!this.isCorrect) {
    this.pointsEarned = 0;
    return;
  }
  
  // Base points for correct answer
  let points = questionPoints;
  
  // Bonus points for quick answers (if time taken is less than 50% of time limit)
  if (this.timeTaken < timeLimit * 0.5) {
    points = Math.round(points * 1.2); // 20% bonus
  }
  
  this.pointsEarned = points;
};

// Get user's performance for a quiz
studentAnswerSchema.statics.getUserQuizPerformance = async function(quizId, userId) {
  const answers = await this.find({ quizId, userId }).populate('questionId');
  
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const totalPoints = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
  const totalTime = answers.reduce((sum, answer) => sum + answer.timeTaken, 0);
  
  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
    totalPoints,
    averageTime: totalQuestions > 0 ? totalTime / totalQuestions : 0
  };
};

// Get quiz statistics
studentAnswerSchema.statics.getQuizStats = async function(quizId) {
  const stats = await this.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: '$questionId',
        totalAnswers: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        averageTime: { $avg: '$timeTaken' },
        totalPoints: { $sum: '$pointsEarned' }
      }
    }
  ]);
  
  return stats;
};

const StudentAnswer = mongoose.model('StudentAnswer', studentAnswerSchema);

export default StudentAnswer; 