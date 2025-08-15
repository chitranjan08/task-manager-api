const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const webpush = require('web-push');
const cookieParser = require('cookie-parser');
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

require('dotenv').config();
require('./config/passport');
const { PORT } = process.env;

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3001', // or your frontend URL
    credentials: true,
  })
);
app.get('/', (req, res) => {
  logger.info('Root path hit');
  res.send('Task Manager API running very well');
});
app.use(passport.initialize());
app.use('/task', TaskRoutes);
app.use('/auth', AuthRoutes);
app.use('/logs', LogRoutes);
app.use('/users', UserRoutes);
app.use('/notifications', NotificationRoutes);
app.use('/chat', ChatRoutes);
app.use('/chat', MessageRoutes);
app.use(globalLimiter);
app.use(errorMiddleware); // Should be at the end
webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
startKafkaConsumer();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
