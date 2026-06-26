import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!email || role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/appointments/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-purple-600 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {appointments.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Total Appointments</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(a => a.status === "BOOKED").length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Active Bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-red-600">
              {appointments.filter(a => a.status === "CANCELLED").length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Cancelled</p>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-700">
              All Appointments
            </h2>
          </div>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No appointments found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{apt.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.patient.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.slot.provider.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.slot.startTime}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          apt.status === "BOOKED"
                            ? "bg-green-100 text-green-600"
                            : apt.status === "CANCELLED"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}