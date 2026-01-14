import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useSalaryComponent = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllSalaryComponents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/salary-component');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getPaginatedSalaryComponents = useCallback(async (params) => {
    setLoading(true);
    try {
      // params: { page, limit, search, type, calculationType }
      const { data } = await axiosSecure.get('/salary-component/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createSalaryComponent = async (payload) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/salary-component/post', payload);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateSalaryComponent = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/salary-component/update/${id}`, payload);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeSalaryComponent = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/salary-component/delete/${id}`);
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
    getAllSalaryComponents, 
    getPaginatedSalaryComponents, 
    createSalaryComponent, 
    updateSalaryComponent, 
    removeSalaryComponent 
  };
};