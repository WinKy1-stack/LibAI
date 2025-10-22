import { MongoClient, Db } from 'mongodb';

// Lấy MongoDB URI từ environment variables
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_DB_NAME || 'lib-ai-db';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface ConnectToMongoDBResult {
  client: MongoClient;
  db: Db;
}

/**
 * Kết nối đến MongoDB với connection pooling
 * Sử dụng cached connection để tránh tạo nhiều connections
 */
export async function connectToMongoDB(): Promise<ConnectToMongoDBResult> {
  // Nếu đã có connection, trả về luôn
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Tạo MongoDB client mới
    const client = new MongoClient(MONGODB_URI);

    // Kết nối
    await client.connect();
    console.log('✅ Đã kết nối MongoDB thành công');

    // Lấy database
    const db = client.db(DB_NAME);

    // Cache lại để dùng cho các request sau
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    throw new Error('Không thể kết nối đến MongoDB');
  }
}

/**
 * Đóng connection đến MongoDB
 */
export async function closeMongoDBConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('✅ Đã đóng connection MongoDB');
  }
}

/**
 * Lấy database instance (dùng cached nếu có)
 */
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToMongoDB();
  return db;
}
