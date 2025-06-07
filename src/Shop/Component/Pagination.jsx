import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

Pagination.propTypes = {
    pagination: PropTypes.object,
    handlerChangePage: PropTypes.func,
    totalPage: PropTypes.number
};

Pagination.defaultProps = {
    pagination: {},
    handlerChangePage: null,
    totalPage: null
}

function Pagination(props) {
    const { pagination, handlerChangePage, totalPage } = props
    const { page } = pagination
    const currentPage = parseInt(page);

    // Tạo mảng các trang cần hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        
        // Giới hạn số trang hiển thị để tránh quá nhiều nút
        if (totalPage <= 7) {
            // Nếu tổng số trang nhỏ, hiển thị tất cả
            for (let i = 1; i <= totalPage; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu
            pageNumbers.push(1);
            
            // Nếu trang hiện tại > 3, thêm dấu ...
            if (currentPage > 3) {
                pageNumbers.push('...');
            }
            
            // Hiển thị các trang xung quanh trang hiện tại
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPage - 1, currentPage + 1);
            
            // Điều chỉnh để luôn hiển thị 3 trang
            if (currentPage <= 3) {
                end = 4;
            }
            
            if (currentPage >= totalPage - 2) {
                start = totalPage - 3;
            }
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            
            // Nếu trang hiện tại < tổng số trang - 2, thêm dấu ...
            if (currentPage < totalPage - 2) {
                pageNumbers.push('...');
            }
            
            // Luôn hiển thị trang cuối
            pageNumbers.push(totalPage);
        }
        
        return pageNumbers;
    };

    const onDownPage = () => {
        if (!handlerChangePage || currentPage <= 1) {
            return;
        }
        handlerChangePage(currentPage - 1);
    }

    const onUpPage = () => {
        if (!handlerChangePage || currentPage >= totalPage) {
            return;
        }
        handlerChangePage(currentPage + 1);
    }

    const onChangeIndex = (value) => {
        if (!handlerChangePage || value === '...') {
            return;
        }
        handlerChangePage(value);
    }

    // Nếu chỉ có 1 trang hoặc không có trang nào, không hiển thị phân trang
    if (!totalPage || totalPage <= 1) {
        return null;
    }

    return (
        <div className="col-lg-6 col-md-6">
            <ul className="pagination-box">
                <li>
                    <button 
                        className={`pagination-btn prev ${currentPage <= 1 ? 'disabled' : ''}`}
                        onClick={onDownPage}
                        disabled={currentPage <= 1}
                        style={{
                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage <= 1 ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            background: '#f5f5f5',
                            border: 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        <i className="fa fa-chevron-left"></i>
                    </button>
                </li>
                
                {getPageNumbers().map((value, index) => (
                    <li 
                        key={index} 
                        className={value === currentPage ? "active" : ''}
                    >
                        {value === '...' ? (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                color: '#666'
                            }}>...</span>
                        ) : (
                            <a 
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    background: value === currentPage ? '#fed700' : '#f5f5f5',
                                    color: value === currentPage ? '#333' : '#666',
                                    fontWeight: value === currentPage ? 'bold' : 'normal',
                                    transition: 'all 0.3s'
                                }} 
                                onClick={() => onChangeIndex(value)}
                            >
                                {value}
                            </a>
                        )}
                    </li>
                ))}
                
                <li>
                    <button 
                        className={`pagination-btn next ${currentPage >= totalPage ? 'disabled' : ''}`}
                        onClick={onUpPage}
                        disabled={currentPage >= totalPage}
                        style={{
                            cursor: currentPage >= totalPage ? 'not-allowed' : 'pointer',
                            opacity: currentPage >= totalPage ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            background: '#f5f5f5',
                            border: 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        <i className="fa fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default Pagination;