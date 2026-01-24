import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useWarehouse = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ---
  const getAllWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/warehouse');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getWarehouseById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(`/warehouse/get-id/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ---
  const createWarehouse = async (warehouseData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/warehouse/post', warehouseData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateWarehouse = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/warehouse/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removeWarehouse = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/warehouse/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedWarehouses = useCallback(async (params) => {
    setLoading(true);
    try {
      // params: { page, limit, search, company }
      const { data } = await axiosSecure.get('/warehouse/paginate', { params });
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
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    removeWarehouse,
    getPaginatedWarehouses
  };
};