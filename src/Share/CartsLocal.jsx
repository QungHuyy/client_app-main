import CartAPI from '../API/CartAPI';

const CartsLocal = {
    // Khởi tạo giỏ hàng nếu chưa tồn tại
    initCart: () => {
        if (!localStorage.getItem('carts')) {
            console.log("Khởi tạo giỏ hàng mới trong localStorage");
            localStorage.setItem('carts', JSON.stringify([]));
        }
        return true;
    },

    // Kiểm tra xem người dùng đã đăng nhập chưa
    isLoggedIn: () => {
        return sessionStorage.getItem('id_user') !== null;
    },
    
    // Lấy ID người dùng đang đăng nhập
    getUserId: () => {
        return sessionStorage.getItem('id_user');
    },

    // Lấy tất cả sản phẩm trong giỏ hàng
    getProduct: async () => {
        try {
            // Nếu đã đăng nhập, luôn ưu tiên lấy giỏ hàng từ server
            if (CartsLocal.isLoggedIn()) {
                try {
                    const userId = CartsLocal.getUserId();
                    const response = await CartAPI.getCartByUser(userId);
                    
                    if (Array.isArray(response) && response.length > 0) {
                        // Chuyển đổi dữ liệu từ server về định dạng giống localStorage
                        const cartItems = response.map(item => ({
                            id_cart: item._id,
                            id_product: item.id_product,
                            name_product: item.name_product,
                            price_product: item.price_product,
                            count: item.count,
                            image: item.image,
                            size: item.size
                        }));
                        
                        // Cập nhật localStorage để đồng bộ - GHI ĐÈ local với data từ server
                        localStorage.setItem('carts', JSON.stringify(cartItems));
                        
                        console.log("Sử dụng giỏ hàng từ server:", cartItems);
                        return cartItems;
                    } else {
                        // Nếu server trả về mảng rỗng, cũng ghi đè localStorage
                        localStorage.setItem('carts', JSON.stringify([]));
                        console.log("Server trả về giỏ hàng rỗng");
                        return [];
                    }
                    
                } catch (error) {
                    console.error("Lỗi khi lấy giỏ hàng từ server:", error);
                    // Fallback to localStorage if server request fails
                    const cartData = localStorage.getItem('carts');
                    const parsedData = cartData ? JSON.parse(cartData) : [];
                    console.log("Fallback sử dụng giỏ hàng từ localStorage:", parsedData);
                    return parsedData;
                }
            }
            
            // Nếu chưa đăng nhập, trả về mảng rỗng - không cho phép xem giỏ hàng
            console.log("Chưa đăng nhập, không thể xem giỏ hàng");
            return [];
        } catch (error) {
            console.error("Lỗi nghiêm trọng trong getProduct:", error);
            // Đảm bảo luôn trả về mảng rỗng khi có lỗi
            return [];
        }
    },

    addProduct: async (data) => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!CartsLocal.isLoggedIn()) {
            console.log("Người dùng chưa đăng nhập, không thể thêm vào giỏ hàng");
            throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        }
        
        // Lấy dữ liệu từ local
        const data_add_cart = data;
        
        // Người dùng đã đăng nhập, thêm vào server
        try {
            const userId = CartsLocal.getUserId();
            
            // Chuẩn bị dữ liệu để gửi lên server
            const serverData = {
                id_user: userId,
                id_product: data_add_cart.id_product,
                name_product: data_add_cart.name_product,
                price_product: data_add_cart.price_product,
                count: data_add_cart.count,
                image: data_add_cart.image,
                size: data_add_cart.size
            };
            
            // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng hay chưa
            const existingCarts = await CartsLocal.getProduct();
            const existingItem = existingCarts.find(item => 
                item.id_product === data_add_cart.id_product && 
                item.size === data_add_cart.size
            );
            
            if (existingItem) {
                // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                await CartAPI.updateCartItem(
                    existingItem.id_cart, 
                    parseInt(existingItem.count) + parseInt(data_add_cart.count)
                );
            } else {
                // Nếu sản phẩm chưa tồn tại, thêm mới
                await CartAPI.addToCart(serverData);
            }
            
            // Sau khi thêm/cập nhật trên server, cập nhật lại localStorage
            const updatedCart = await CartAPI.getCartByUser(userId);
            
            if (Array.isArray(updatedCart)) {
                const formattedCart = updatedCart.map(item => ({
                    id_cart: item._id,
                    id_product: item.id_product,
                    name_product: item.name_product,
                    price_product: item.price_product,
                    count: item.count,
                    image: item.image,
                    size: item.size
                }));
                
                localStorage.setItem('carts', JSON.stringify(formattedCart));
            }
            
            return;
        } catch (error) {
            console.error("Error adding product to server cart:", error);
            throw error;
        }
    },

    deleteProduct: async (id_cart) => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!CartsLocal.isLoggedIn()) {
            console.log("Người dùng chưa đăng nhập, không thể xóa sản phẩm khỏi giỏ hàng");
            throw new Error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng!");
        }
        
        // Nếu đã đăng nhập, xóa trên server
        try {
            await CartAPI.removeCartItem(id_cart);
            
            // Cập nhật lại localStorage sau khi xóa trên server
            const userId = CartsLocal.getUserId();
            const updatedCart = await CartAPI.getCartByUser(userId);
            
            if (Array.isArray(updatedCart)) {
                const formattedCart = updatedCart.map(item => ({
                    id_cart: item._id,
                    id_product: item.id_product,
                    name_product: item.name_product,
                    price_product: item.price_product,
                    count: item.count,
                    image: item.image,
                    size: item.size
                }));
                
                localStorage.setItem('carts', JSON.stringify(formattedCart));
            }
            
            return;
        } catch (error) {
            console.error("Error removing product from server cart:", error);
            throw error;
        }
    },

    updateProduct: async (data) => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!CartsLocal.isLoggedIn()) {
            console.log("Người dùng chưa đăng nhập, không thể cập nhật giỏ hàng");
            throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
        }
        
        const data_update_cart = data;
        
        // Nếu đã đăng nhập, cập nhật trên server
        try {
            await CartAPI.updateCartItem(data_update_cart.id_cart, data_update_cart.count);
            
            // Cập nhật lại localStorage sau khi cập nhật trên server
            const userId = CartsLocal.getUserId();
            const updatedCart = await CartAPI.getCartByUser(userId);
            
            if (Array.isArray(updatedCart)) {
                const formattedCart = updatedCart.map(item => ({
                    id_cart: item._id,
                    id_product: item.id_product,
                    name_product: item.name_product,
                    price_product: item.price_product,
                    count: item.count,
                    image: item.image,
                    size: item.size
                }));
                
                localStorage.setItem('carts', JSON.stringify(formattedCart));
            }
            
            return;
        } catch (error) {
            console.error("Error updating product quantity in server cart:", error);
            throw error;
        }
    },
    
    // Đồng bộ giỏ hàng từ localStorage lên server khi đăng nhập
    syncCartToServer: async (userId) => {
        try {
            // Lấy giỏ hàng từ server trước
            const serverCart = await CartAPI.getCartByUser(userId);
            
            // Lấy giỏ hàng từ localStorage
            const localCart = JSON.parse(localStorage.getItem('carts') || '[]');
            
            // Nếu cả server và local đều không có giỏ hàng, không cần đồng bộ
            if ((!Array.isArray(serverCart) || serverCart.length === 0) && localCart.length === 0) {
                return true;
            }
            
            // Nếu server có giỏ hàng nhưng local không có, chỉ cần cập nhật localStorage
            if (Array.isArray(serverCart) && serverCart.length > 0 && localCart.length === 0) {
                const formattedCart = serverCart.map(item => ({
                    id_cart: item._id,
                    id_product: item.id_product,
                    name_product: item.name_product,
                    price_product: item.price_product,
                    count: item.count,
                    image: item.image,
                    size: item.size
                }));
                
                localStorage.setItem('carts', JSON.stringify(formattedCart));
                return true;
            }
            
            // Nếu local có giỏ hàng nhưng server không có, cập nhật server
            if ((!Array.isArray(serverCart) || serverCart.length === 0) && localCart.length > 0) {
                // Thêm từng sản phẩm vào giỏ hàng trên server
                for (const item of localCart) {
                    const serverData = {
                        id_user: userId,
                        id_product: item.id_product,
                        name_product: item.name_product,
                        price_product: item.price_product,
                        count: item.count,
                        image: item.image,
                        size: item.size
                    };
                    
                    await CartAPI.addToCart(serverData);
                }
                
                // Cập nhật lại localStorage với dữ liệu mới từ server
                const updatedCart = await CartAPI.getCartByUser(userId);
                if (Array.isArray(updatedCart)) {
                    const formattedCart = updatedCart.map(item => ({
                        id_cart: item._id,
                        id_product: item.id_product,
                        name_product: item.name_product,
                        price_product: item.price_product,
                        count: item.count,
                        image: item.image,
                        size: item.size
                    }));
                    
                    localStorage.setItem('carts', JSON.stringify(formattedCart));
                }
                return true;
            }
            
            // Cả server và local đều có giỏ hàng, hợp nhất chúng
            const mergedCart = [];
            const serverItems = new Map();
            
            // Tạo Map từ server cart để kiểm tra trùng lặp dễ dàng hơn
            if (Array.isArray(serverCart)) {
                serverCart.forEach(item => {
                    const key = `${item.id_product}-${item.size}`;
                    serverItems.set(key, item);
                });
            }
            
            // Xử lý các mục trong local cart
            for (const localItem of localCart) {
                const key = `${localItem.id_product}-${localItem.size}`;
                
                if (serverItems.has(key)) {
                    // Sản phẩm đã tồn tại trên server, cập nhật số lượng
                    const serverItem = serverItems.get(key);
                    const newCount = localItem.count + serverItem.count;
                    
                    // Cập nhật trên server
                    await CartAPI.updateCartItem(serverItem._id, newCount);
                    
                    // Xóa mục này khỏi serverItems để tránh xử lý lại
                    serverItems.delete(key);
                } else {
                    // Sản phẩm chưa có trên server, thêm mới
                    const serverData = {
                        id_user: userId,
                        id_product: localItem.id_product,
                        name_product: localItem.name_product,
                        price_product: localItem.price_product,
                        count: localItem.count,
                        image: localItem.image,
                        size: localItem.size
                    };
                    
                    await CartAPI.addToCart(serverData);
                }
            }
            
            // Các mục còn lại trong serverItems vẫn giữ nguyên
            
            // Cập nhật lại localStorage với dữ liệu mới từ server
            const updatedCart = await CartAPI.getCartByUser(userId);
            if (Array.isArray(updatedCart)) {
                const formattedCart = updatedCart.map(item => ({
                    id_cart: item._id,
                    id_product: item.id_product,
                    name_product: item.name_product,
                    price_product: item.price_product,
                    count: item.count,
                    image: item.image,
                    size: item.size
                }));
                
                localStorage.setItem('carts', JSON.stringify(formattedCart));
            }
            
            return true;
        } catch (error) {
            console.error("Error syncing cart to server:", error);
            return false;
        }
    },
    
    // Xóa toàn bộ giỏ hàng
    clearCart: async () => {
        try {
            // Nếu đã đăng nhập, xóa giỏ hàng trên server
            if (CartsLocal.isLoggedIn()) {
                const userId = CartsLocal.getUserId();
                await CartAPI.clearCart(userId);
            }
            
            // Xóa giỏ hàng trong localStorage
            localStorage.setItem('carts', JSON.stringify([]));
            
            return true;
        } catch (error) {
            console.error("Error clearing cart:", error);
            return false;
        }
    },
    
    // Xóa toàn bộ giỏ hàng khi đăng xuất
    clearCartOnLogout: () => {
        try {
            console.log("Xóa giỏ hàng khi đăng xuất");
            
            // Xóa toàn bộ giỏ hàng khỏi localStorage
            localStorage.setItem('carts', JSON.stringify([]));
            
            console.log("Đã xóa giỏ hàng thành công");
            return true;
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            return false;
        }
    }
};

export default CartsLocal;