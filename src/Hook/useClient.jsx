import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";

export const useClient = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ---
  const getAllClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get("/client");
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getClientById = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`/client/get-id/${id}`);
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
  const getClientsByCity = useCallback(
    async (city) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get(`/client/${city}/get-all`);
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
  const createClient = async (clientData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/client/post", clientData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateClient = async (id, updateData) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.put(
        `/client/update/${id}`,
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
  const removeClient = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/client/delete/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION ---
  const getPaginatedClients = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const { data } = await axiosSecure.get("/client/paginate", { params });
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
    getAllClients,
    getClientById,
    getClientsByCity,
    createClient,
    updateClient,
    removeClient,
    getPaginatedClients,
  };
};
