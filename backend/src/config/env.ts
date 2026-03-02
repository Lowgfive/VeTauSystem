/**
 * Environment variables bootstrap
 * MUST be imported FIRST in server.ts before any other project modules.
 */
import dotenv from "dotenv";
import path from "path";

// Trỏ đúng vào backend/.env dù cwd là thư mục nào
const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error(`❌ Failed to load .env from: ${envPath}`, result.error.message);
}
