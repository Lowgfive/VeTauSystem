import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});