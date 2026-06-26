import { useState, useEffect } from "react";
import { createSlot, getAvailableSlots } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ProviderDashboard() {
  const [slots, setSlots] = useState([]);
  const [activeTab, setActiveTab] = useState("slots");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
  });
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!email || role !== "PROVIDER") {
      navigate("/login");
      return;
    }
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await getAvailableSlots(2);
      setSlots(response.data);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await createSlot({
        email: email,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      setMessage("Slot created successfully!");
      setFormData({ startTime: "", endTime: "" });
      fetchSlots();
    } catch (err) {
      setMessage("Failed to create slot!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Provider Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-green-600 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-100"
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
            onClick={() => setActiveTab("slots")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "slots"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Slots
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "create"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Create Slot
          </button>
        </div>

        {/* My Slots Tab */}
        {activeTab === "slots" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Available Slots
            </h2>
            {slots.length === 0 ? (
              <p className="text-gray-500">No slots found. Create one!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white rounded-lg shadow p-6 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        Start: {slot.startTime}
                      </p>
                      <p className="text-gray-500 text-sm">
                        End: {slot.endTime}
                      </p>
                      <span className="text-xs font-medium px-2 py-1 rounded mt-2 inline-block bg-green-100 text-green-600">
                        {slot.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Slot Tab */}
        {activeTab === "create" && (
          <div className="bg-white rounded-lg shadow p-6 max-w-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Create New Slot
            </h2>
            <form onSubmit={handleCreateSlot}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                Create Slot
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}