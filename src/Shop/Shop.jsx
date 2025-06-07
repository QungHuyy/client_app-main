import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string'
import Product from '../API/Product';
import { Link, useParams } from 'react-router-dom';
import Products from './Component/Products';
import Pagination from './Component/Pagination';
import Search from './Component/Search';

Shop.propTypes = {

};

function Shop(props) {

    const { id } = useParams()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFilterModal, setShowFilterModal] = useState(false)

    //Tổng số trang
    const [totalPage, setTotalPage] = useState()

    //Từng trang hiện tại
    const [pagination, setPagination] = useState({
        page: '1',
        count: '9',
        search: '',
        category: id,
        gender: '' // Thêm tham số gender
    })

    // Bộ lọc nâng cao
    const [filters, setFilters] = useState({
        priceRange: null,
        hasPromotion: null,
        sortBy: 'default'
    });

    // Khoảng giá
    const priceRanges = [
        { min: 0, max: 500000, label: 'Dưới 500K' },
        { min: 500000, max: 1000000, label: '500K - 1M' },
        { min: 1000000, max: 2000000, label: '1M - 2M' },
        { min: 2000000, max: 99999999, label: 'Trên 2M' },
    ];

    // Tùy chọn sắp xếp
    const sortOptions = [
        { key: 'default', label: 'Mặc định' },
        { key: 'price_asc', label: 'Giá thấp → cao' },
        { key: 'price_desc', label: 'Giá cao → thấp' },
        { key: 'name_asc', label: 'Tên A → Z' },
        { key: 'name_desc', label: 'Tên Z → A' },
    ];

    //Hàm này dùng để thay đổi state pagination.page
    //Nó sẽ truyền xuống Component con và nhận dữ liệu từ Component con truyền lên
    const handlerChangePage = (value) => {
        console.log("Value: ", value)

        //Sau đó set lại cái pagination để gọi chạy làm useEffect gọi lại API pagination
        setPagination({
            page: value,
            count: pagination.count,
            search: pagination.search,
            category: pagination.category,
            gender: pagination.gender // Giữ lại giá trị gender
        })
    }

    // Cập nhật useEffect để xử lý gender từ URL
    useEffect(() => {
        // Kiểm tra nếu id là 'male', 'female' hoặc 'unisex' thì đó là gender
        let categoryId = id;
        let genderValue = '';
        
        if (id === 'male' || id === 'female' || id === 'unisex') {
            genderValue = id;
            categoryId = 'all'; // Nếu lọc theo gender thì category là all
        }

        setPagination({
            page: '1',
            count: pagination.count,
            search: pagination.search,
            category: categoryId,
            gender: genderValue
        })
    }, [id])

    // Cập nhật API call để gửi tham số gender
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const params = {
                page: pagination.page,
                count: pagination.count,
                search: pagination.search,
                category: pagination.category,
                gender: pagination.gender
            }
            
            console.log("Params being sent:", params);

            const query = '?' + queryString.stringify(params)
            const response = await Product.Get_Pagination(query)
            console.log("Response from API:", response);
            
            let filteredProducts = response;
            
            // Áp dụng bộ lọc nâng cao
            if (filters.priceRange) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = parseInt(product.price_product);
                    return price >= filters.priceRange.min && price <= filters.priceRange.max;
                });
            }
            
            if (filters.hasPromotion !== null) {
                filteredProducts = filteredProducts.filter(product => {
                    if (filters.hasPromotion) {
                        return product.promotion && product.promotion > 0;
                    } else {
                        return !product.promotion || product.promotion === 0;
                    }
                });
            }
            
            // Sắp xếp sản phẩm
            filteredProducts = sortProducts(filteredProducts, filters.sortBy);
            
            setProducts(filteredProducts);
            
            // Tính tổng số trang
            const params_total_page = {
                id_category: pagination.category,
                gender: pagination.gender // Thêm tham số gender
            }

            const query_total_page = '?' + queryString.stringify(params_total_page)
            const response_total_page = await Product.Get_Category_Product(query_total_page)
            const totalPage = Math.ceil(parseInt(response_total_page.length) / parseInt(pagination.count))
            setTotalPage(totalPage)
            setLoading(false);
        }

        fetchData()
    }, [pagination, filters])

    // Hàm sắp xếp sản phẩm
    const sortProducts = (products, sortBy) => {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'price_asc':
                return sorted.sort((a, b) => {
                    const priceA = a.promotion ? a.price_product - (a.price_product * a.promotion / 100) : parseInt(a.price_product);
                    const priceB = b.promotion ? b.price_product - (b.price_product * b.promotion / 100) : parseInt(b.price_product);
                    return priceA - priceB;
                });
            case 'price_desc':
                return sorted.sort((a, b) => {
                    const priceA = a.promotion ? a.price_product - (a.price_product * a.promotion / 100) : parseInt(a.price_product);
                    const priceB = b.promotion ? b.price_product - (b.price_product * b.promotion / 100) : parseInt(b.price_product);
                    return priceB - priceA;
                });
            case 'name_asc':
                return sorted.sort((a, b) => a.name_product.localeCompare(b.name_product));
            case 'name_desc':
                return sorted.sort((a, b) => b.name_product.localeCompare(a.name_product));
            default:
                return sorted;
        }
    };

    // Đặt lại bộ lọc
    const resetFilters = () => {
        setFilters({
            priceRange: null,
            hasPromotion: null,
            sortBy: 'default'
        });
    };

    // Đếm số bộ lọc đang hoạt động
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.priceRange) count++;
        if (filters.hasPromotion !== null) count++;
        if (filters.sortBy !== 'default') count++;
        return count;
    };

    const [male, set_male] = useState([])
    const [female, set_female] = useState([])

    // Gọi API theo phương thức GET để load category
    useEffect(() => {

        const fetchData = async () => {

            // gender = male
            const params_male = {
                gender: 'male'
            }

            const query_male = '?' + queryString.stringify(params_male)

            const response_male = await Product.Get_Category_Gender(query_male)

            set_male(response_male)

            // gender = female
            const params_female = {
                gender: 'female'
            }

            const query_female = '?' + queryString.stringify(params_female)

            const response_female = await Product.Get_Category_Gender(query_female)

            set_female(response_female)

        }

        fetchData()

    }, [])

    const handler_Search = (value) => {
        console.log("Search: ", value)
        
        setPagination({
            page: pagination.page,
            count: pagination.count,
            search: value,
            category: pagination.category,
            gender: pagination.gender // Giữ lại giá trị gender
        })
    }

    // Xử lý thay đổi giới tính
    const handleGenderChange = (gender) => {
        setPagination({
            ...pagination,
            gender: gender,
            page: '1'
        });
    };

    return (
        <div>
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Cửa hàng</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="li-main-blog-page li-main-blog-details-page pt-60 pb-60 pb-sm-45 pb-xs-45">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 order-lg-1 order-2">
                            <div className="li-blog-sidebar-wrapper">
                                <div className="li-blog-sidebar">
                                    <div className="li-sidebar-search-form">
                                        <Search handler_Search={handler_Search} />
                                    </div>
                                </div>
                                
                                {/* Bộ lọc giới tính */}
                                <div className="li-blog-sidebar pt-25">
                                    <h4 className="li-blog-sidebar-title">Giới tính</h4>
                                    <ul className="li-blog-archive">
                                        <li>
                                            <Link 
                                                to="/shop/all" 
                                                onClick={() => handleGenderChange('')}
                                                style={pagination.gender === '' ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Tất cả
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to="/shop/male" 
                                                onClick={() => handleGenderChange('male')}
                                                style={pagination.gender === 'male' ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Nam
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to="/shop/female" 
                                                onClick={() => handleGenderChange('female')}
                                                style={pagination.gender === 'female' ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Nữ
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to="/shop/unisex" 
                                                onClick={() => handleGenderChange('unisex')}
                                                style={pagination.gender === 'unisex' ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Unisex
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                
                                {/* Bộ lọc khoảng giá */}
                                <div className="li-blog-sidebar pt-25">
                                    <h4 className="li-blog-sidebar-title">Khoảng giá</h4>
                                    <ul className="li-blog-archive">
                                        {priceRanges.map((range, index) => (
                                            <li key={index}>
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            priceRange: prev.priceRange?.label === range.label ? null : range
                                                        }));
                                                    }}
                                                    style={filters.priceRange?.label === range.label ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                                >
                                                    {range.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Bộ lọc khuyến mãi */}
                                <div className="li-blog-sidebar pt-25">
                                    <h4 className="li-blog-sidebar-title">Khuyến mãi</h4>
                                    <ul className="li-blog-archive">
                                        <li>
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        hasPromotion: prev.hasPromotion === true ? null : true
                                                    }));
                                                }}
                                                style={filters.hasPromotion === true ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Có khuyến mãi
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        hasPromotion: prev.hasPromotion === false ? null : false
                                                    }));
                                                }}
                                                style={filters.hasPromotion === false ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}
                                            >
                                                Không khuyến mãi
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                
                                {/* Danh mục sản phẩm */}
                                <div className="li-blog-sidebar pt-25">
                                    <h4 className="li-blog-sidebar-title">Danh mục</h4>
                                    <ul className="li-blog-archive">
                                        <li><Link to="/shop/all" style={id === 'all' ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}>Tất cả</Link></li>
                                    </ul>
                                </div>
                                <div className="li-blog-sidebar pt-25">
                                    <h4 className="li-blog-sidebar-title">Nam</h4>
                                    <ul className="li-blog-archive">
                                        {
                                            male && male.map(value => (
                                                <li key={value._id}>
                                                    <Link to={`/shop/${value._id}`} style={id === value._id ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}>{value.category}</Link>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <div className="li-blog-sidebar">
                                    <h4 className="li-blog-sidebar-title">Nữ</h4>
                                    <ul className="li-blog-archive">
                                        {
                                            female && female.map(value => (
                                                <li key={value._id}>
                                                    <Link to={`/shop/${value._id}`} style={id === value._id ? { cursor: 'pointer', color: '#fed700' } : { cursor: 'pointer' }}>{value.category}</Link>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                
                                {/* Nút đặt lại bộ lọc */}
                                {getActiveFiltersCount() > 0 && (
                                    <div className="li-blog-sidebar pt-25">
                                        <button 
                                            className="btn btn-primary btn-block" 
                                            onClick={resetFilters}
                                            style={{
                                                backgroundColor: '#fed700',
                                                borderColor: '#fed700',
                                                color: '#333',
                                                fontWeight: 'bold',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#e6c300';
                                                e.currentTarget.style.borderColor = '#e6c300';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fed700';
                                                e.currentTarget.style.borderColor = '#fed700';
                                            }}
                                        >
                                            Đặt lại bộ lọc
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-9 order-1 order-lg-2">
                            <div className="shop-top-bar">
                                <div className="product-select-box">
                                    <div className="product-short">
                                        <p>Sắp xếp theo:</p>
                                        <select 
                                            className="nice-select"
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.key} value={option.key}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Hiển thị số lượng sản phẩm và bộ lọc đang hoạt động */}
                                <div className="shop-top-bar-right">
                                    <div className="product-found">
                                        <p>Tìm thấy <strong>{products.length}</strong> sản phẩm</p>
                                    </div>
                                    {getActiveFiltersCount() > 0 && (
                                        <div className="filter-badge" style={{
                                            display: 'inline-block',
                                            backgroundColor: '#fed700',
                                            color: '#333',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '50%',
                                            marginLeft: '10px',
                                            fontSize: '12px'
                                        }}>
                                            {getActiveFiltersCount()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="shop-products-wrapper">
                                <div className="tab-content">
                                    <div id="grid-view" className="tab-pane active" role="tabpanel">
                                        <div className="product-area shop-product-area">
                                            {loading ? (
                                                <div className="text-center py-5">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="sr-only">Đang tải...</span>
                                                    </div>
                                                    <p className="mt-2">Đang tải sản phẩm...</p>
                                                </div>
                                            ) : products.length > 0 ? (
                                                <Products products={products} />
                                            ) : (
                                                <div className="text-center py-5">
                                                    <div className="empty-state">
                                                        <i className="fa fa-search" style={{fontSize: '48px', color: '#ccc'}}></i>
                                                        <h4 className="mt-3">Không tìm thấy sản phẩm</h4>
                                                        <p>Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="paginatoin-area">
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6">
                                                <p>Hiển thị {products.length > 0 ? `1-${Math.min(products.length, pagination.count)}` : '0'} trên {products.length} sản phẩm</p>
                                            </div>
                                            <Pagination pagination={pagination} handlerChangePage={handlerChangePage} totalPage={totalPage} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Shop;
