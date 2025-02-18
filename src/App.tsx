import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Calendar } from "./components/Calendar";
import { EventForm } from "./components/EventForm";
import { UserSettings } from "./components/UserSettings";
import { useCalendar } from "./hooks/useCalendar";
import { Pencil } from "lucide-react";
import { HomeIcon } from "lucide-react";

import toast from "react-hot-toast";
import { Event } from "./lib/api";

const CalendarView = () => {
  const { id } = useParams<{ id: string }>();
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);

  const {
    calendar,
    events,
    userPrefs,
    updateCalendarName,
    addEvent,
    updateEvent,
    deleteEvent,
    updateUserPreferences,
  } = useCalendar(id ?? "");

  const [calendarName, setCalendarName] = useState("New Calendar");
  if (!id) {
    return <Navigate to="/" />;
  }
  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedDates({ start, end });
    setShowEventForm(true);
  };

  const handleEventEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (
    title: string,
    description: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!selectedDates && !editingEvent) return;

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title,
          description: description || "",
          start_date: startDate || new Date(editingEvent.start_date),
          end_date: endDate || new Date(editingEvent.end_date),
        });
        toast.success("Event updated successfully!");
      } else {
        await addEvent(
          title,
          description,
          startDate || selectedDates!.start,
          endDate || selectedDates!.end
        );
        toast.success("Event created successfully!");
      }
    } catch (error) {
      toast.error(
        `Failed to create event: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }

    setShowEventForm(false);
    setSelectedDates(null);
    setEditingEvent(null);
  };

  const handleEventUpdate = async (
    id: string,
    updates: { title: string; description: string }
  ) => {
    try {
      await updateEvent(id, updates);
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error(
        `Failed to update event: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error(
        `Failed to delete event: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <Link to={"/"}>
              <HomeIcon />
            </Link>
            {isEditingName ? (
              <input
                type="text"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                onBlur={(e) => {
                  setIsEditingName(false);
                  updateCalendarName(e.target.value);
                }}
                autoFocus
                className="text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
            ) : (
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {calendar?.name}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </h1>
            )}
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: userPrefs.color + "40" }}
              >
                {userPrefs.name}
              </div>
              <UserSettings
                name={userPrefs.name}
                color={userPrefs.color}
                onUpdate={updateUserPreferences}
              />
            </div>
          </div>
        </div>

        <Calendar
          events={events}
          onDateSelect={handleDateSelect}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onEventEdit={handleEventEdit}
        />

        {showEventForm && (
          <EventForm
            startDate={
              editingEvent
                ? new Date(editingEvent.start_date)
                : selectedDates!.start
            }
            endDate={
              editingEvent
                ? new Date(editingEvent.end_date)
                : selectedDates!.end
            }
            event={
              editingEvent
                ? {
                    title: editingEvent.title,
                    description: editingEvent.description || "",
                  }
                : undefined
            }
            onSubmit={handleEventSubmit}
            onClose={() => {
              setShowEventForm(false);
              setSelectedDates(null);
              setEditingEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
export default CalendarView;
