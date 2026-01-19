import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const usePaymentType = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ---
  const getAllPaymentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/payment-type');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getPaymentTypeById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(`/payment-type/get-id/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ---
  const createPaymentType = async (paymentData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/payment-type/post', paymentData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updatePaymentType = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/payment-type/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removePaymentType = async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.delete(`/payment-type/delete/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedPaymentTypes = useCallback(async (params) => {
    setLoading(true);
    try {
      // params could be { page: 1, limit: 10, search: "" }
      const { data } = await axiosSecure.get('/payment-type/paginate', { params });
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
    getAllPaymentTypes,
    getPaymentTypeById,
    createPaymentType,
    updatePaymentType,
    removePaymentType,
    getPaginatedPaymentTypes
  };
};

export default usePaymentType;