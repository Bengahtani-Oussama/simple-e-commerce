import dotenv from 'dotenv';
import connectDatabase from '../config/database';
import Admin from '../models/Admin';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDatabase();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'admin123456', // Change this password immediately after first login!
      permissions: ['all'],
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();