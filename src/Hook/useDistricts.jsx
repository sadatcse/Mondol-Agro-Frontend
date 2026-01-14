import { useState, useEffect } from "react";
import districtData from "../assets/District.json";

/**
 * Custom hook to manage Bangladesh district & division data
 */
const useDistricts = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!Array.isArray(districtData)) {
        throw new Error("District data is not an array");
      }
      setDistricts(districtData);
    } catch (err) {
      console.error("Failed to load district data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Get unique divisions
  const divisions = [...new Set(districts.map(d => d.division))];

  // 🔹 Get districts by division
  const getDistrictsByDivision = (divisionName) => {
    return districts.filter(d => d.division === divisionName);
  };

  return {
    districts,
    divisions,
    getDistrictsByDivision,
    loading,
    error,
  };
};

export default useDistricts;
