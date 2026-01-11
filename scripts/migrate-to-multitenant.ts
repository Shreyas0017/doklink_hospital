/**
 * Data Migration Script
 * Use this if you have existing data in the old database structure
 * 
 * This script will:
 * 1. Create a hospital entry
 * 2. Create an admin user
 * 3. Move existing data to the hospital's database
 */

import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_uri';

async function migrateData() {
  if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_uri') {
    console.error('❌ Please set MONGODB_URI in your .env.local file');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Configuration - UPDATE THESE VALUES
    const hospitalConfig = {
      name: 'Your Hospital Name',
      code: 'hosp_001', // Unique code
      address: 'Your Hospital Address',
      phone: '+1-234-567-8900',
      email: 'contact@hospital.com',
    };

    const adminConfig = {
      name: 'Admin Name',
      email: 'admin@hospital.com',
      password: 'change_this_password', // CHANGE THIS
      phone: '+1-234-567-8900',
    };

    // Step 1: Create Hospital
    console.log('\n📋 Creating hospital...');
    const mainDb = client.db('doklink_main');
    
    // Check if hospital already exists
    const existingHospital = await mainDb.collection('hospitals').findOne({
      code: hospitalConfig.code
    });

    let hospitalId: ObjectId;
    
    if (existingHospital) {
      console.log('ℹ️  Hospital already exists, using existing ID');
      hospitalId = existingHospital._id;
    } else {
      const hospitalResult = await mainDb.collection('hospitals').insertOne({
        ...hospitalConfig,
        code: hospitalConfig.code.toLowerCase(),
        email: hospitalConfig.email.toLowerCase(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      hospitalId = hospitalResult.insertedId;
      console.log('✅ Hospital created:', hospitalId);
    }

    // Step 2: Create Admin User
    console.log('\n👤 Creating admin user...');
    
    const existingUser = await mainDb.collection('users').findOne({
      email: adminConfig.email.toLowerCase()
    });

    if (existingUser) {
      console.log('ℹ️  Admin user already exists');
    } else {
      const passwordHash = await bcrypt.hash(adminConfig.password, 10);
      await mainDb.collection('users').insertOne({
        hospitalId,
        name: adminConfig.name,
        email: adminConfig.email.toLowerCase(),
        passwordHash,
        role: 'Admin',
        isActive: true,
        phone: adminConfig.phone,
        department: 'Administration',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin user created');
    }

    // Step 3: Migrate existing data
    console.log('\n📦 Migrating existing data...');
    
    const oldDb = client.db('doklink'); // Your old database name
    const newDb = client.db(`doklink_hospital_${hospitalId}`);

    const collections = ['beds', 'patients', 'claims', 'documents', 'activities'];

    for (const collectionName of collections) {
      try {
        const oldCollection = oldDb.collection(collectionName);
        const count = await oldCollection.countDocuments();

        if (count === 0) {
          console.log(`⏭️  Skipping ${collectionName} (no data)`);
          continue;
        }

        const data = await oldCollection.find({}).toArray();
        
        // Add hospitalId to each document
        const dataWithHospitalId = data.map(doc => ({
          ...doc,
          hospitalId,
          _id: doc._id || new ObjectId(), // Preserve existing IDs
          createdAt: doc.createdAt || new Date(),
          updatedAt: new Date(),
        }));

        await newDb.collection(collectionName).insertMany(dataWithHospitalId);
        console.log(`✅ Migrated ${count} ${collectionName}`);
      } catch (error) {
        console.log(`⚠️  Could not migrate ${collectionName}:`, error.message);
      }
    }

    console.log('\n✨ Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Login with:', adminConfig.email);
    console.log('2. Password:', adminConfig.password);
    console.log('3. ⚠️  CHANGE YOUR PASSWORD after first login!');
    console.log('4. You can now delete the old "doklink" database if migration was successful');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
console.log('🚀 Starting data migration...');
console.log('⚠️  IMPORTANT: Backup your database before running this!\n');

migrateData().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
