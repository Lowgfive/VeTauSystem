import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";


dotenv.config();

const app = express();
app.use(express.json());

// Connect Database
connectDB();

app.get("/", (req, res) => {
  res.send("VeTau System API running...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});