import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";

const useEmployeeAdvance = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = "/employee-advance"; // Based on standard naming convention

  // --- GET ALL ---
  const getAllAdvances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(BASE_URL);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getAdvanceById = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`${BASE_URL}/get-id/${id}`);
        return data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [axiosSecure]
  );

  // --- GET BY EMPLOYEE ---
  const getAdvancesByEmployee = useCallback(
    async (employeeId) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`${BASE_URL}/${employeeId}/get-all`);
        return data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [axiosSecure]
  );

  // --- CREATE ---
  const createAdvance = async (advanceData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post(`${BASE_URL}/post`, advanceData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateAdvance = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(
        `${BASE_URL}/update/${id}`,
        updateData
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removeAdvance = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`${BASE_URL}/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedAdvances = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`${BASE_URL}/paginate`, { params });
        return data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [axiosSecure]
  );

  return {
    loading,
    error,
    getAllAdvances,
    getAdvanceById,
    getAdvancesByEmployee,
    createAdvance,
    updateAdvance,
    removeAdvance,
    getPaginatedAdvances,
  };
};

export default useEmployeeAdvance;