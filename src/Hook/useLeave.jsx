import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useLeave = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/leave');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getPaginatedLeaves = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/leave/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createLeave = async (leaveData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/leave/post', leaveData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateLeave = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/leave/update/${id}`, updateData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeLeave = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/leave/delete/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    error, 
    getAllLeaves, 
    getPaginatedLeaves, 
    createLeave, 
    updateLeave, 
    removeLeave 
  };
};