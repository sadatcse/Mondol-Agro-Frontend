import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useEmployeeLeave = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);

  const getPaginatedLeaves = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/employee-leave/paginate', { params });
      return data;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createLeave = async (leaveData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/employee-leave/post', leaveData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateLeave = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/employee-leave/update/${id}`, updateData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const removeLeave = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/employee-leave/delete/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return { loading, getPaginatedLeaves, createLeave, updateLeave, removeLeave };
};