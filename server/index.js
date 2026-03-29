const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const summaryRoutes = require('./routes/summary');
const bookmarkRoutes = require('./routes/bookmarks');
const preferenceRoutes = require('./routes/preferences');
const historyRoutes = require('./routes/history');
const dailynewsRoutes = require('./routes/dailynews');


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dailynews', dailynewsRoutes);

app.get('/', (req, res) => res.json({ message: 'Server running!' }));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});