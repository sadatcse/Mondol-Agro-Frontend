import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";

const useEmployeeAdvanceRepayment = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = "/employee-advance-repayment";

  // --- GET ALL (Paginated) ---
  const getPaginatedRepayments = useCallback(
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

  // --- GET BY ID ---
  const getRepaymentById = useCallback(
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

  // --- CREATE ---
  const createRepayment = async (repaymentData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post(`${BASE_URL}/post`, repaymentData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateRepayment = async (id, updateData) => {
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
  const removeRepayment = async (id) => {
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

  return {
    loading,
    error,
    getPaginatedRepayments,
    getRepaymentById,
    createRepayment,
    updateRepayment,
    removeRepayment,
  };
};

export default useEmployeeAdvanceRepayment;