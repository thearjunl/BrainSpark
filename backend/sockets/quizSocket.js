import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import StudentAnswer from '../models/StudentAnswer.js';

// Store active quiz sessions
const activeSessions = new Map();

export const setupSocketIO = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Join quiz room
    socket.on('join-quiz', async (data) => {
      try {
        const { quizId } = data;
        
        if (!quizId) {
          socket.emit('error', { message: 'Quiz ID is required' });
          return;
        }

        const quiz = await Quiz.findById(quizId)
          .populate('groupId', 'name')
          .populate('createdBy', 'name');

        if (!quiz) {
          socket.emit('error', { message: 'Quiz not found' });
          return;
        }

        // Check if user is member of the group
        const isMember = quiz.groupId.members.some(member => 
          member.user.toString() === socket.user._id.toString()
        );

        if (!isMember && socket.user.role !== 'teacher') {
          socket.emit('error', { message: 'You are not a member of this group' });
          return;
        }

        // Join the quiz room
        socket.join(`quiz-${quizId}`);
        
        // Add user to active session
        if (!activeSessions.has(quizId)) {
          activeSessions.set(quizId, {
            quiz,
            participants: new Map(),
            currentQuestion: 0,
            isActive: false
          });
        }

        const session = activeSessions.get(quizId);
        session.participants.set(socket.user._id.toString(), {
          user: socket.user,
          socketId: socket.id,
          score: 0,
          answers: []
        });

        // Notify others that user joined
        socket.to(`quiz-${quizId}`).emit('user-joined', {
          userId: socket.user._id,
          userName: socket.user.name,
          userRole: socket.user.role
        });

        // Send current quiz state to user
        socket.emit('quiz-joined', {
          quiz: {
            id: quiz._id,
            name: quiz.name,
            description: quiz.description,
            totalQuestions: quiz.questions.length,
            status: quiz.status
          },
          session: {
            isActive: session.isActive,
            currentQuestion: session.currentQuestion,
            participants: Array.from(session.participants.values()).map(p => ({
              userId: p.user._id,
              userName: p.user.name,
              userRole: p.user.role,
              score: p.score
            }))
          }
        });

        console.log(`User ${socket.user.name} joined quiz ${quizId}`);

      } catch (error) {
        console.error('Join quiz error:', error);
        socket.emit('error', { message: 'Failed to join quiz' });
      }
    });

    // Teacher starts quiz
    socket.on('start-quiz', async (data) => {
      try {
        const { quizId } = data;
        
        if (socket.user.role !== 'teacher') {
          socket.emit('error', { message: 'Only teachers can start quizzes' });
          return;
        }

        const session = activeSessions.get(quizId);
        if (!session) {
          socket.emit('error', { message: 'Quiz session not found' });
          return;
        }

        // Update quiz status in database
        await Quiz.findByIdAndUpdate(quizId, {
          'session.isLive': true,
          'session.startTime': new Date(),
          status: 'active'
        });

        session.isActive = true;
        session.currentQuestion = 0;

        // Broadcast quiz start to all participants
        io.to(`quiz-${quizId}`).emit('quiz-started', {
          message: 'Quiz has started!',
          currentQuestion: 0,
          totalQuestions: session.quiz.questions.length
        });

        // Send first question after 3 seconds
        setTimeout(() => {
          sendQuestion(io, quizId, 0);
        }, 3000);

        console.log(`Quiz ${quizId} started by teacher ${socket.user.name}`);

      } catch (error) {
        console.error('Start quiz error:', error);
        socket.emit('error', { message: 'Failed to start quiz' });
      }
    });

    // Teacher moves to next question
    socket.on('next-question', async (data) => {
      try {
        const { quizId } = data;
        
        if (socket.user.role !== 'teacher') {
          socket.emit('error', { message: 'Only teachers can control quiz flow' });
          return;
        }

        const session = activeSessions.get(quizId);
        if (!session || !session.isActive) {
          socket.emit('error', { message: 'No active quiz session' });
          return;
        }

        session.currentQuestion++;

        if (session.currentQuestion >= session.quiz.questions.length) {
          // Quiz finished
          await endQuiz(io, quizId);
        } else {
          // Send next question
          sendQuestion(io, quizId, session.currentQuestion);
        }

      } catch (error) {
        console.error('Next question error:', error);
        socket.emit('error', { message: 'Failed to move to next question' });
      }
    });

    // Student submits answer
    socket.on('submit-answer', async (data) => {
      try {
        const { quizId, questionIndex, answer, timeTaken } = data;
        
        if (socket.user.role !== 'student') {
          socket.emit('error', { message: 'Only students can submit answers' });
          return;
        }

        const session = activeSessions.get(quizId);
        if (!session || !session.isActive) {
          socket.emit('error', { message: 'No active quiz session' });
          return;
        }

        const question = session.quiz.questions[questionIndex];
        if (!question) {
          socket.emit('error', { message: 'Question not found' });
          return;
        }

        // Check if answer is correct
        const isCorrect = question.type === 'mcq' 
          ? answer === question.correctAnswer
          : answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

        // Calculate points
        const points = isCorrect ? question.points : 0;

        // Update participant score
        const participant = session.participants.get(socket.user._id.toString());
        if (participant) {
          participant.score += points;
          participant.answers.push({
            questionIndex,
            answer,
            isCorrect,
            points,
            timeTaken
          });
        }

        // Save answer to database
        await StudentAnswer.create({
          quizId,
          questionId: question._id,
          userId: socket.user._id,
          answerText: answer,
          isCorrect,
          pointsEarned: points,
          timeTaken
        });

        // Send confirmation to student
        socket.emit('answer-submitted', {
          questionIndex,
          isCorrect,
          points,
          totalScore: participant.score
        });

        // Update leaderboard for all participants
        updateLeaderboard(io, quizId);

        console.log(`Student ${socket.user.name} submitted answer for question ${questionIndex}`);

      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      
      // Remove user from all active sessions
      activeSessions.forEach((session, quizId) => {
        if (session.participants.has(socket.user._id.toString())) {
          session.participants.delete(socket.user._id.toString());
          
          // Notify others
          socket.to(`quiz-${quizId}`).emit('user-left', {
            userId: socket.user._id,
            userName: socket.user.name
          });
        }
      });
    });
  });
};

// Helper function to send question to all participants
const sendQuestion = (io, quizId, questionIndex) => {
  const session = activeSessions.get(quizId);
  if (!session) return;

  const question = session.quiz.questions[questionIndex];
  if (!question) return;

  // Remove correct answer for students
  const questionForStudents = {
    _id: question._id,
    questionText: question.questionText,
    type: question.type,
    options: question.options,
    timeLimit: question.timeLimit
  };

  io.to(`quiz-${quizId}`).emit('new-question', {
    question: questionForStudents,
    questionIndex,
    totalQuestions: session.quiz.questions.length
  });

  console.log(`Sent question ${questionIndex} to quiz ${quizId}`);
};

// Helper function to update leaderboard
const updateLeaderboard = (io, quizId) => {
  const session = activeSessions.get(quizId);
  if (!session) return;

  const leaderboard = Array.from(session.participants.values())
    .map(p => ({
      userId: p.user._id,
      userName: p.user.name,
      score: p.score
    }))
    .sort((a, b) => b.score - a.score);

  io.to(`quiz-${quizId}`).emit('leaderboard-update', { leaderboard });
};

// Helper function to end quiz
const endQuiz = async (io, quizId) => {
  try {
    const session = activeSessions.get(quizId);
    if (!session) return;

    // Update quiz in database
    await Quiz.findByIdAndUpdate(quizId, {
      'session.isLive': false,
      'session.endTime': new Date(),
      status: 'completed'
    });

    // Send final results
    const finalLeaderboard = Array.from(session.participants.values())
      .map(p => ({
        userId: p.user._id,
        userName: p.user.name,
        score: p.score,
        totalAnswers: p.answers.length
      }))
      .sort((a, b) => b.score - a.score);

    io.to(`quiz-${quizId}`).emit('quiz-ended', {
      message: 'Quiz has ended!',
      finalLeaderboard,
      totalQuestions: session.quiz.questions.length
    });

    // Clean up session
    activeSessions.delete(quizId);

    console.log(`Quiz ${quizId} ended`);

  } catch (error) {
    console.error('End quiz error:', error);
  }
};

export default setupSocketIO; 