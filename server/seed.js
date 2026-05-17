const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@atomquest.com',
      password: 'password123',
      role: 'Admin',
      department: 'HR'
    });

    // Create Manager
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@atomquest.com',
      password: 'password123',
      role: 'Manager',
      department: 'Engineering'
    });

    // Create Employee
    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@atomquest.com',
      password: 'password123',
      role: 'Employee',
      department: 'Engineering',
      managerId: manager._id
    });

    console.log('Seed data inserted successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@atomquest.com / password123');
    console.log('Manager: manager@atomquest.com / password123');
    console.log('Employee: employee@atomquest.com / password123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
