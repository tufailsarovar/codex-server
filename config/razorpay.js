// server/config/razorpay.js
import dotenv from "dotenv";
import Razorpay from "razorpay";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load ../.env (server/.env)
dotenv.config({ path: path.join(__dirname, "../.env") });

// Debug: see if env is loaded (you should see your key id, DO NOT share it)
console.log("RAZORPAY_KEY_ID from env:", process.env.RAZORPAY_KEY_ID);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay env vars missing. Check server/.env");
  process.exit(1);
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
