import { getDatabase } from '../utils/mongodb';
import { ObjectId } from 'mongodb';
import type { User } from '../types';

/**
 * Service quản lý users trong MongoDB
 */
export class UserService {
  private collectionName = 'users';

  /**
   * Lấy tất cả users
   */
  async getAllUsers(): Promise<User[]> {
    const db = await getDatabase();
    const users = await db.collection<User>(this.collectionName).find({}).toArray();
    return users;
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const user = await db.collection<User>(this.collectionName).findOne({ _id: new ObjectId(id) });
    return user;
  }

  /**
   * Tạo user mới
   */
  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    const db = await getDatabase();
    const result = await db.collection(this.collectionName).insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: result.insertedId.toString(),
      ...userData,
    };
  }

  /**
   * Cập nhật user
   */
  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<User>(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Xóa user
   */
  async deleteUser(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<User>(this.collectionName).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

// Export singleton instance
export const userService = new UserService();
