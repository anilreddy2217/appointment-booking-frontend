import { useState, useEffect } from "react";
import { getAllProviders, getMyAppointments, bookAppointment, cancelAppointment } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("providers");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!email || role !== "PATIENT") {
      navigate("/login");
      return;
    }
    fetchProviders();
    fetchAppointments();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await getAllProviders();
      setProviders(response.data);
    } catch (err) {
      console.error("Error fetching providers", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getMyAppointments(3);
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setMessage("Appointment cancelled successfully!");
      fetchAppointments();
    } catch (err) {
      setMessage("Failed to cancel appointment!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Appointment Booking System</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {message && (
          <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("providers")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "providers"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Find Providers
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "appointments"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Appointments
          </button>
        </div>

        {/* Providers Tab */}
        {activeTab === "providers" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Available Providers
            </h2>
            {providers.length === 0 ? (
              <p className="text-gray-500">No providers found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {provider.user.name}
                    </h3>
                    <p className="text-blue-600 text-sm mt-1">
                      {provider.specialty}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      📍 {provider.location}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      📞 {provider.phone}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{provider.bio}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              My Appointments
            </h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-lg shadow p-6 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {apt.slot.provider.user.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {apt.slot.startTime}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Notes: {apt.notes}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded mt-2 inline-block ${
                          apt.status === "BOOKED"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {apt.status === "BOOKED" && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}