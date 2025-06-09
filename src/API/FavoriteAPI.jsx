import axiosClient from './axiosClient';
import { FAVORITE_API } from './config';

const FavoriteAPI = {
    // Lấy danh sách sản phẩm yêu thích của user
    getFavorites: (userId) => {
        const url = `${FAVORITE_API}/${userId}`;
        return axiosClient.get(url);
    },

    // Thêm sản phẩm vào yêu thích
    addFavorite: (data) => {
        const url = FAVORITE_API;
        return axiosClient.post(url, data);
    },

    // Xóa sản phẩm khỏi yêu thích
    removeFavorite: (data) => {
        const url = FAVORITE_API;
        return axiosClient.delete(url, { data });
    },

    // Kiểm tra sản phẩm có trong yêu thích không
    checkFavorite: (userId, productId) => {
        const url = `${FAVORITE_API}/check/${userId}/${productId}`;
        return axiosClient.get(url);
    },

    // Toggle favorite (thêm/xóa)
    async toggleFavorite(userId, productId) {
        try {
            // Kiểm tra trạng thái hiện tại
            const checkResult = await this.checkFavorite(userId, productId);
            const isFavorite = checkResult.isFavorite;
            
            if (isFavorite) {
                // Nếu đã yêu thích thì xóa
                const result = await this.removeFavorite({ id_user: userId, id_product: productId });
                return {
                    success: result.success,
                    isFavorite: false,
                    message: result.message
                };
            } else {
                // Nếu chưa yêu thích thì thêm
                const result = await this.addFavorite({ id_user: userId, id_product: productId });
                return {
                    success: result.success,
                    isFavorite: true,
                    message: result.message
                };
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return {
                success: false,
                isFavorite: false,
                message: 'Lỗi khi thay đổi trạng thái yêu thích'
            };
        }
    }
};

export default FavoriteAPI; 