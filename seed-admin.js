const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const ADMIN = {
  name: 'Admin',
  email: 'admin@errbud.com',
  password: 'Admin@2026',
  role: 'admin',
};

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('Admin already exists:', ADMIN.email);
    process.exit(0);
  }

  await User.create(ADMIN);
  console.log('Admin created successfully!');
  console.log('Email:   ', ADMIN.email);
  console.log('Password:', ADMIN.password);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
