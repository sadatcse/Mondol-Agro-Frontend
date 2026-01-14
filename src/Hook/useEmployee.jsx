import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';



export const useEmployee = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ---
  const getAllEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/employee');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getEmployeeById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(`/employee/get-id/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ---
  const createEmployee = async (employeeData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/employee/post', employeeData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateEmployee = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/employee/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removeEmployee = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/employee/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDirectoryEmployees = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/employee/directory-list', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- PAGINATION ---
  const getPaginatedEmployees = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/employee/paginate', { params });
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
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    removeEmployee,
    getDirectoryEmployees,
    getPaginatedEmployees
  };
};