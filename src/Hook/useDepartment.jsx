import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useDepartment = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/department');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getPaginatedDepartments = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/department/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createDepartment = async (departmentData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/department/post', departmentData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/department/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeDepartment = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/department/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    error, 
    getAllDepartments, 
    getPaginatedDepartments, 
    createDepartment, 
    updateDepartment, 
    removeDepartment 
  };
};