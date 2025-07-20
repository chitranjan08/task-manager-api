const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = require('./server/server');
const connectDB = require('./config/db');
const AuthRoutes = require('./routes/authRoutes');
const TaskRoutes = require('./routes/taskRoutes');

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
  res.send('Task Manager API running');
});

app.use('/task', TaskRoutes);
app.use('/auth', AuthRoutes);
app.use(errorMiddleware); // Should be at the end

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
