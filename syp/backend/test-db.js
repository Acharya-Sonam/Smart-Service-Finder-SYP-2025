import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function testConnection() {
    try {
        console.log('Testing connection with:');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Password:', process.env.DB_PASSWORD ? '***' : 'empty');
        console.log('Database:', process.env.DB_NAME);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to MySQL successfully!');
        const [rows] = await connection.execute('SELECT 1+1 as result');
        console.log('✅ Query test:', rows[0].result === 2 ? 'PASSED' : 'FAILED');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();