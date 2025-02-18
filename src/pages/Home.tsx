import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { calendarApi } from "../lib/api";
import toast from "react-hot-toast";

export default function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = React.useState(false);

  const createCalendar = async () => {
    setIsCreating(true);
    try {
      const calendar = await calendarApi.create("New Calendar");
      navigate(`/${calendar.id}`);
      toast.success("Calendar created successfully!");
    } catch (error) {
      toast.error("Failed to create calendar" + error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="bg-blue-600 text-white p-4 rounded-full">
            <CalendarIcon className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Collaborative Calendar
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Create a shared calendar and collaborate with your team in real-time.
          No sign-up required!
        </p>

        <button
          onClick={createCalendar}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CalendarIcon className="w-6 h-6" />
              Create New Calendar
            </>
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Your calendar will be accessible via a unique URL that you can share
          with others
        </p>
      </div>
    </div>
  );
}
