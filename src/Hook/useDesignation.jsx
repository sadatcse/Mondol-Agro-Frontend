import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useDesignation = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/designation');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getPaginatedDesignations = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/designation/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createDesignation = async (designationData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/designation/post', designationData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateDesignation = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/designation/update/${id}`, updateData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeDesignation = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/designation/delete/${id}`);
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
    getAllDesignations, 
    getPaginatedDesignations, 
    createDesignation, 
    updateDesignation, 
    removeDesignation 
  };
};