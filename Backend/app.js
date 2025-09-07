require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const webpush = require('web-push');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // ✅ Security
const compression = require('compression'); // ✅ Performance
const { app, server } = require('./server/server');
const connectDB = require('./config/db');
const AuthRoutes = require('./routes/authRoutes');
const TaskRoutes = require('./routes/taskRoutes');
const LogRoutes = require('./routes/logRoutes');
const UserRoutes = require('./routes/userRoutes');
const NotificationRoutes = require('./routes/notifications');
const ChatRoutes = require('./routes/chatRoutes');
const MessageRoutes = require('./routes/messageRoutes');
const startKafkaConsumer = require('./kafka/consumer');
const { globalLimiter } = require('./middlewares/rateLimiter');
const errorMiddleware = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

require('./config/passport');
const { PORT } = process.env || 3000;

// ✅ Connect to DB before starting server
connectDB();

// ✅ Middleware setup
app.use(helmet()); // Security headers
app.use(compression()); // Gzip responses
app.use(bodyParser.urlencoded({ extended: true })); // set true for nested objects
app.use(bodyParser.json({ limit: '10mb' })); // add request size limit
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  })
);

// ✅ Root route
app.get('/', (req, res) => {
  logger.info('Root path hit');
  res.status(200).json({ message: 'Task Manager API running' });
});

// ✅ Passport init
app.use(passport.initialize());

// ✅ API routes (add versioning)
app.use('/task', TaskRoutes);
app.use('/auth', AuthRoutes);
app.use('/logs', LogRoutes);
app.use('/users', UserRoutes);
app.use('/notifications', NotificationRoutes);
app.use('/chat', ChatRoutes);
app.use('/chat', MessageRoutes);

// ✅ Apply global rate limiter before routes if needed
app.use(globalLimiter);

// ✅ Error handler should be last
app.use(errorMiddleware);

// ✅ Web Push config
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@yourapp.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  logger.warn('Webpush keys not configured!');
}

// ✅ Kafka consumer start
startKafkaConsumer();

// ✅ Graceful shutdown
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server started on port ${PORT}`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => process.exit(0));
});
