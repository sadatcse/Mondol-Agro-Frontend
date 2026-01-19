import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useExpenseCategory = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL (Non-paginated) ---
  const getAllExpenseCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/expense-category');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getExpenseCategoryById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(`/expense-category/get-id/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ---
  const createExpenseCategory = async (categoryData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/expense-category/post', categoryData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateExpenseCategory = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/expense-category/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removeExpenseCategory = async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.delete(`/expense-category/delete/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedExpenseCategories = useCallback(async (params) => {
    setLoading(true);
    try {
      // params: { page: 1, limit: 10, search: "" }
      const { data } = await axiosSecure.get('/expense-category/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  return {
    loading,
    error,
    getAllExpenseCategories,
    getExpenseCategoryById,
    createExpenseCategory,
    updateExpenseCategory,
    removeExpenseCategory,
    getPaginatedExpenseCategories
  };
};

export default useExpenseCategory;