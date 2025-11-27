import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import bootstrapRoutes from "./routes/bootstrap.routes";
import labelsRoutes from "./routes/labels.routes";
import notesRoutes from "./routes/notes.routes";
import "./types/express";
import { env } from "./utils/env";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/labels", labelsRoutes);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
