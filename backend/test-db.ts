import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI || "";
console.log("URI:", uri);

mongoose.connect(uri).then(async () => {
    console.log("Connected to db name:", mongoose.connection.name);
    const db = mongoose.connection.db;
    if (!db) return;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    const users = db.collection("users");
    const count = await users.countDocuments();
    console.log("Total users:", count);
    const user = await users.findOne({ email: "baolong2000k3@gmail.com" });
    console.log("User found by email:", user);
    process.exit(0);
}).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
