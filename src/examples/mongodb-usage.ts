import { userService } from '../services/userService';
import { connectToMongoDB } from '../utils/mongodb';

/**
 * Example: Sử dụng MongoDB và UserService
 * 
 * Chú ý: Đảm bảo MongoDB đang chạy và có cấu hình trong .env
 */

async function exampleUsage() {
  try {
    // 1. Kết nối MongoDB
    console.log('Đang kết nối MongoDB...');
    await connectToMongoDB();

    // 2. Tạo user mới
    const newUser = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });
    console.log('✅ User mới:', newUser);

    // 3. Lấy tất cả users
    const allUsers = await userService.getAllUsers();
    console.log('📋 Tất cả users:', allUsers);

    // 4. Lấy user theo ID
    if (newUser._id) {
      const userId = typeof newUser._id === 'string' ? newUser._id : newUser._id.toString();
      const foundUser = await userService.getUserById(userId);
      console.log('🔍 Tìm user:', foundUser);
    }

    // 5. Cập nhật user
    if (newUser._id) {
      const userId = typeof newUser._id === 'string' ? newUser._id : newUser._id.toString();
      await userService.updateUser(userId, {
        name: 'Updated Name',
      });
      console.log('✏️ Đã cập nhật user');
    }

    // 6. Xóa user
    if (newUser._id) {
      const userId = typeof newUser._id === 'string' ? newUser._id : newUser._id.toString();
      await userService.deleteUser(userId);
      console.log('🗑️ Đã xóa user');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Uncomment dòng dưới để chạy example
// exampleUsage();

export { exampleUsage };
