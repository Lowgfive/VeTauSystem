import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import  UserModel  from './src/models/user.model';
import { UserRole } from './src/types/auth.type';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/BookingSystem');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    };

    const existing = await UserModel.findOne({ email: adminUser.email });
    if (existing) {
      console.log('Admin already exists');
    } else {
      await UserModel.create(adminUser);
      console.log('Admin user created: admin@test.com / admin123');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
