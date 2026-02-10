import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";

export const useVendor = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ---
  const getAllVendors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get("/vendor");
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getVendorById = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`/vendor/get-id/${id}`);
        return data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [axiosSecure]
  );

  // --- GET BY CITY ---
  const getVendorsByCity = useCallback(
    async (city) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`/vendor/${city}/get-all`);
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
  const createVendor = async (vendorData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/vendor/post", vendorData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateVendor = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(
        `/vendor/update/${id}`,
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
  const removeVendor = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/vendor/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedVendors = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get("/vendor/paginate", { params });
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
    getAllVendors,
    getVendorById,
    getVendorsByCity,
    createVendor,
    updateVendor,
    removeVendor,
    getPaginatedVendors,
  };
};

export default useVendor;