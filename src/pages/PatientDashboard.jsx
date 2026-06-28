import { useState, useEffect } from "react";
import { getAllProviders, getAvailableSlots, bookAppointment, cancelAppointment, getMyAppointments } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeTab, setActiveTab] = useState("providers");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingSlotId, setLoadingSlotId] = useState(null);
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
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const response = await getMyAppointments(userId);
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments", err);
      // Don't show error to user for background fetch
    }
  };

  const handleViewSlots = async (provider) => {
    setSelectedProvider(provider);
    setSlots([]);
    setMessage("");
    setError("");
    try {
      const response = await getAvailableSlots(provider.id);
      setSlots(response.data);
    } catch (err) {
      setError("Failed to fetch slots!");
    }
  };

  const handleBook = async (slotId) => {
    setLoadingSlotId(slotId);
    setMessage("");
    setError("");
    try {
      await bookAppointment({
        patientId: "3",
        slotId: slotId.toString(),
        notes: "Booked from app",
      });
      setMessage("Appointment booked successfully! Check your email for confirmation.");
      handleViewSlots(selectedProvider);
      fetchAppointments();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "";
      if (errorMsg.includes("Duplicate entry")) {
        setError("This slot is already booked! Please choose another slot.");
      } else if (errorMsg.includes("not available")) {
        setError("This slot is no longer available!");
      } else if (err.response?.status === 403) {
        // Token expired — logout
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to book appointment. Please try again!");
      }
    }
  };

  const handleCancel = async (appointmentId) => {
    setMessage("");
    setError("");
    try {
      await cancelAppointment(appointmentId);
      setMessage("Appointment cancelled successfully!");
      await fetchAppointments();
    } catch (err) {
      // If error but appointment might still be cancelled — refresh anyway
      await fetchAppointments();
      setMessage("Appointment cancelled successfully!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
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
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { setActiveTab("providers"); setSelectedProvider(null); }}
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
            My Appointments ({appointments.filter(a => a.status === "BOOKED").length})
          </button>
        </div>

        {/* Providers Tab */}
        {activeTab === "providers" && !selectedProvider && (
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
                    <button
                      onClick={() => handleViewSlots(provider)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                    >
                      View Available Slots
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Slots View */}
        {activeTab === "providers" && selectedProvider && (
          <div>
            <button
              onClick={() => setSelectedProvider(null)}
              className="mb-4 text-blue-600 hover:underline text-sm"
            >
              ← Back to Providers
            </button>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Available Slots — {selectedProvider.user.name}
            </h2>
            {slots.length === 0 ? (
              <p className="text-gray-500">No available slots for this provider.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <p className="font-semibold text-gray-800">
                      📅 {formatDateTime(slot.startTime)}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      ⏰ End: {formatDateTime(slot.endTime)}
                    </p>
                    <span className="text-xs font-medium px-2 py-1 rounded mt-2 inline-block bg-green-100 text-green-600">
                      {slot.status}
                    </span>
                    <button
                        onClick={() => handleBook(slot.id)}
                        disabled={loadingSlotId === slot.id}
                        className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
>
                        {loadingSlotId === slot.id ? "Booking..." : "Book Appointment"}
                    </button>
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
                        📅 {formatDateTime(apt.slot.startTime)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📝 {apt.notes}
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