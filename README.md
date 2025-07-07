# 🧠 BrainSpark - AI-Powered Quiz Platform

BrainSpark is a modern, real-time quiz platform that uses AI to generate questions from PDF notes. Teachers can upload educational materials and create interactive quizzes, while students can participate in live quiz sessions with real-time leaderboards.

## ✨ Features

### For Teachers 👨‍🏫
- **User Authentication**: Secure registration and login system
- **PDF Upload & Processing**: Upload educational PDFs and extract text automatically
- **AI Question Generation**: Generate 5 MCQs and 5 short-answer questions using OpenAI GPT-4
- **Group Management**: Create and manage classes/groups with unique codes
- **Quiz Creation**: Build quizzes from AI-generated questions
- **Live Quiz Sessions**: Start real-time quiz sessions with student participation
- **Real-time Leaderboards**: Monitor student performance in live sessions
- **Analytics**: Track student performance and quiz statistics

### For Students 👨‍🎓
- **User Authentication**: Secure registration and login system
- **Join Groups**: Enter group codes to join classes
- **Live Quiz Participation**: Answer questions in real-time during quiz sessions
- **Real-time Feedback**: Get immediate feedback on answers
- **Live Leaderboards**: See rankings update in real-time
- **Performance Tracking**: View personal quiz history and scores

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.IO** - Real-time communication
- **OpenAI API** - AI question generation
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **JWT** + **bcrypt** - Authentication and security
- **Tailwind CSS** - Styling

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BrainSpark
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file with VITE_API_URL=http://localhost:5000/api
   npm run dev
   ```

4. **Environment Configuration**

   **Backend (.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/brainspark
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   OPENAI_API_KEY=your-openai-api-key-here
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## 📁 Project Structure

```
BrainSpark/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── openai.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Quiz.js
│   │   ├── StudentAnswer.js
│   │   └── PdfUpload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── quizRoutes.js
│   │   └── pdfRoutes.js
│   ├── sockets/
│   │   └── quizSocket.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── GroupCard.jsx
│   │   │   ├── QuizCard.jsx
│   │   │   ├── QuizQuestion.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── UploadPdfPage.jsx
│   │   │   ├── QuizSessionPage.jsx
│   │   │   └── LeaderboardPage.jsx
│   │   ├── routes/
│   │   │   └── PrivateRoute.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Groups
- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/join` - Join a group by code
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Quizzes
- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes` - Get quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id/start` - Start quiz session
- `PUT /api/quizzes/:id/end` - End quiz session

### PDF Upload
- `POST /api/pdf/upload` - Upload PDF file
- `GET /api/pdf/uploads` - Get user's uploads
- `GET /api/pdf/uploads/:id` - Get upload details

## 🎮 Usage Guide

### For Teachers

1. **Register/Login**: Create an account with teacher role
2. **Create Groups**: Set up classes with unique codes
3. **Upload PDFs**: Upload educational materials
4. **Review Questions**: Review AI-generated questions
5. **Create Quizzes**: Build quizzes from questions
6. **Start Sessions**: Begin live quiz sessions
7. **Monitor Progress**: Watch real-time leaderboards

### For Students

1. **Register/Login**: Create an account with student role
2. **Join Groups**: Enter group codes to join classes
3. **Participate**: Join live quiz sessions
4. **Answer Questions**: Submit answers in real-time
5. **Track Progress**: View personal performance

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Rate limiting
- CORS protection
- Input validation and sanitization

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Install dependencies: `npm install`
4. Start production server: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔮 Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Question bank management
- [ ] Quiz templates
- [ ] Mobile app
- [ ] Integration with LMS platforms
- [ ] Multi-language support
- [ ] Advanced question types
- [ ] Performance optimization

---

**Built with ❤️ for modern education** 