import React from 'react';
import { Link } from 'react-router-dom';

function ResultDialog({ open, onClose, products }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={onClose} // Click ra nền ngoài để đóng
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 6,
          maxWidth: 600,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()} // Ngăn click trong dialog đóng nó
      >
        <h2 style={{ marginTop: 0 }}>Kết quả tìm kiếm</h2>

        {products.length === 0 ? (
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {products.map((prod) => (
              <li
                key={prod._id}
                style={{
                  marginBottom: 15,
                  borderBottom: '1px solid #ccc',
                  paddingBottom: 10,
                }}
              >
                <Link
                  to={`/detail/${prod._id}`}
                  style={{
                    display: 'flex',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <img
                    src={prod.image}
                    alt={prod.name_product}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      marginRight: 10,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <h3 style={{ margin: '0 0 5px' }}>{prod.name_product}</h3>
                    <p style={{ margin: '0 0 5px' }}>{prod.describe}</p>
                    <p style={{ margin: '0 0 5px' }}>
                      Giá: {prod.price_product.toLocaleString()} VND
                    </p>
<p style={{ margin: '0 0 5px' }}>
  Độ tương đồng: {(prod.similarity_score * 100).toFixed(2)}%
</p>

                  
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default ResultDialog;
