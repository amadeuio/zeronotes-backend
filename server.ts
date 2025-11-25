import express from 'express';
import cors from 'cors';
import notesRoutes from './routes/notes';
import labelsRoutes from './routes/labels';

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

