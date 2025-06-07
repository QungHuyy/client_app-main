import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

Search.propTypes = {
    handler_Search: PropTypes.func
};

Search.defaultProps = {
    handler_Search: null
}

function Search(props) {
    const { handler_Search } = props
    const [search, set_search] = useState('')
    const [typingTimeout, setTypingTimeout] = useState(null)

    // Xử lý tìm kiếm với debounce để tránh gọi API quá nhiều
    const onChangeText = (e) => {
        const value = e.target.value
        set_search(value)

        // Xóa timeout cũ nếu người dùng vẫn đang gõ
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }

        // Đặt timeout mới để đợi người dùng ngừng gõ
        const timeout = setTimeout(() => {
            if (handler_Search) {
                handler_Search(value)
            }
        }, 500) // Đợi 500ms sau khi người dùng ngừng gõ

        setTypingTimeout(timeout)
    }

    // Xóa timeout khi component unmount
    useEffect(() => {
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout)
            }
        }
    }, [typingTimeout])

    // Xóa từ khóa tìm kiếm
    const handleClearSearch = () => {
        set_search('')
        if (handler_Search) {
            handler_Search('')
        }
    }

    // Ngăn chặn form submit
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handler_Search) {
            handler_Search(search)
        }
    }

    return (
        <form action="#" onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper" style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                <input 
                    type="text" 
                    className="li-search-field" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    value={search} 
                    onChange={onChangeText}
                    style={{
                        width: '100%',
                        padding: '10px 40px 10px 15px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}
                />
                {search ? (
                    <button 
                        type="button" 
                        className="clear-search-btn"
                        onClick={handleClearSearch}
                        style={{
                            position: 'absolute',
                            right: '40px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#999'
                        }}
                    >
                        <i className="fa fa-times-circle"></i>
                    </button>
                ) : null}
                <button 
                    type="submit" 
                    className="li-search-btn" 
                    style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: search ? '#333' : '#999'
                    }}
                >
                    <i className="fa fa-search"></i>
                </button>
            </div>
        </form>
    );
}

export default Search;