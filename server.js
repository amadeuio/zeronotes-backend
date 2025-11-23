const express = require('express');
const cors = require('cors');
const notesRoutes = require('./routes/notes');
const labelsRoutes = require('./routes/labels');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/api/notes', notesRoutes);
app.use('/api/labels', labelsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});