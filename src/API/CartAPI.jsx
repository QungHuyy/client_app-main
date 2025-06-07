import axiosClient from './axiosClient'

const CartAPI = {
    // Lấy giỏ hàng theo ID người dùng
    getCartByUser: (userId) => {
        const url = `/api/Cart/user/${userId}`
        return axiosClient.get(url)
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: (data) => {
        const url = '/api/Cart'
        return axiosClient.post(url, data)
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartItem: (id, count) => {
        const url = `/api/Cart/${id}`
        return axiosClient.put(url, { count })
    },

    // Xóa một sản phẩm khỏi giỏ hàng
    removeCartItem: (id) => {
        const url = `/api/Cart/${id}`
        return axiosClient.delete(url)
    },
    
    // Xóa toàn bộ giỏ hàng của một người dùng
    clearCart: (userId) => {
        const url = `/api/Cart/user/${userId}`
        return axiosClient.delete(url)
    }
}

export default CartAPI