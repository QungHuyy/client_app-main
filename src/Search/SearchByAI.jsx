import React from 'react';
import { useSelector } from 'react-redux';

const SearchByAI = () => {
  // Lấy kết quả tìm kiếm đã lưu trong store
  const results = useSelector(state => state.searchResults);
  console.log('search results:', results);

  if (!results || !results.matched_products || results.matched_products.length === 0) {
    
    return <p>Không tìm thấy sản phẩm nào.</p>;
  }

  return (
    <div>
      <h2>Kết quả tìm kiếm bằng hình ảnh</h2>
      <div className="product-list">
        {results.matched_products.map(product => (
          <div key={product._id} style={{ border: '1px solid #ddd', marginBottom: '10px', padding: '10px' }}>
            <img src={product.image} alt={product.name_product} style={{ width: '150px' }} />
            <h3>{product.name_product}</h3>
            <p>{product.describe}</p>
            <p>Giới tính: {product.gender}</p>
            <p>Danh mục: {product.id_category}</p>
            <p>Giá: {product.price_product.toLocaleString('vi-VN')}₫</p>
            <p>Kho hàng: 
              {Object.entries(product.inventory).map(([size, qty]) => (
                <span key={size} style={{ marginLeft: 5 }}>{size}: {qty}</span>
              ))}
            </p>
            <p style={{ fontStyle: 'italic', color: '#888' }}>
              Độ tương đồng AI: {(product.similarity_score * 100).toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchByAI;
