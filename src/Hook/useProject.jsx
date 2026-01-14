import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';


export const useProject = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPaginatedProjects = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/project/paginate', { params });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createProject = async (projectData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post('/project/post', projectData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(`/project/update/${id}`, updateData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/project/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getPaginatedProjects, createProject, updateProject, removeProject };
};