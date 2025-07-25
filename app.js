const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = require('./server/server');
const connectDB = require('./config/db');
const AuthRoutes = require('./routes/authRoutes');
const TaskRoutes = require('./routes/taskRoutes');
const LogRoutes = require('./routes/logRoutes');
const { globalLimiter } = require("./middlewares/rateLimiter");
const errorMiddleware = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

require('dotenv').config();

const { PORT } = process.env;

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000', // or your frontend URL
    credentials: true,
  })
);
app.get('/', (req, res) => {
  logger.info('Root path hit');
  res.send('Task Manager API running very well');
});

app.use('/task', TaskRoutes);
app.use('/auth', AuthRoutes);
app.use('/logs', LogRoutes);
app.use(globalLimiter);
app.use(errorMiddleware); // Should be at the end

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
