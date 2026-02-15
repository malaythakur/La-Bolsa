import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('Testing database connection...\n');
    
    if (!MONGODB_URI) {
        console.error('❌ ERROR: MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    console.log('MongoDB URI found:', MONGODB_URI.replace(/\/\/.*:.*@/, '//<credentials>@'));

    try {
        await mongoose.connect(MONGODB_URI, { bufferCommands: false });
        console.log('\n✅ SUCCESS: Connected to MongoDB!');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Host:', mongoose.connection.host);
        
        await mongoose.connection.close();
        console.log('\n✅ Connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR: Failed to connect to MongoDB');
        console.error('Error message:', error.message);
        process.exit(1);
    }
}

testConnection();
