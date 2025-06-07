import axiosClient from './axiosClient'

const Product = {

    Get_All_Product: () => {
        const url = '/api/Product'
        return axiosClient.get(url)
    },

    Get_Category_Product: (query) => {
        const url = `/api/Product/category${query}`
        return axiosClient.get(url)
    },

    Get_Detail_Product: (id) => {
        const url = `/api/Product/${id}`
        return axiosClient.get(url)
    },

    Get_Category_Gender: (query) => {
        const url = `/api/Product/category/gender${query}`
        return axiosClient.get(url)
    },

    Get_Pagination: (query) => {
        const url = `/api/Product/category/pagination${query}`
        return axiosClient.get(url)
    },

    get_search_list: (query) => {
        const url = `/api/Product/scoll/page${query}`
        return axiosClient.get(url)
    },

    Get_New_Products: (limit = 8) => {
        const url = `/api/Product/new?limit=${limit}`
        return axiosClient.get(url)
    },

    Get_Best_Selling: (limit = 8) => {
        const url = `/api/Product/bestseller?limit=${limit}`
        return axiosClient.get(url)
    },
    
    Get_Product_Stats: (id) => {
        const url = `/api/Product/stats/${id}`
        return axiosClient.get(url)
    },
    
    Get_Similar_Products: (id, limit = 8) => {
        const url = `/api/Product/similar/${id}?limit=${limit}`
        return axiosClient.get(url)
    }

}

export default Product