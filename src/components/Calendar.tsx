import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  lastDayOfMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightDouble,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Database } from "../lib/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface CalendarProps {
  events: Event[];
  onDateSelect: (start: Date, end: Date) => void;
  onEventEdit: (event: Event) => void;
  onEventUpdate: (
    id: string,
    updates: { title: string; description: string }
  ) => void;
  onEventDelete: (id: string) => void;
}

interface EventGroup {
  title: string;
  color: string;
  monthlyDays: { [key: string]: number };
  events: Event[];
}

export function Calendar({
  events,
  onDateSelect,
  onEventUpdate,
  onEventDelete,
  onEventEdit,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventSummaryOpen, setIsEventSummaryOpen] = useState(true);
  const [includeWeekends, setIncludeWeekends] = useState(true);

  const monthStart = startOfWeek(startOfMonth(currentDate));
  const monthEnd = endOfWeek(endOfMonth(currentDate));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast.error("Cannot create events in the past");
      return;
    }

    if (!selectionStart) {
      setSelectionStart(date);
      setSelectionEnd(null);
    } else {
      const start = date < selectionStart ? date : selectionStart;
      const end = date < selectionStart ? selectionStart : date;
      onDateSelect(start, end);
      setSelectionStart(date);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  const handleMouseEnter = (date: Date) => {
    if (selectionStart) {
      setSelectionEnd(date);
    }
  };

  const isSelected = (date: Date) => {
    if (!selectionStart || !selectionEnd) return false;
    const start = selectionEnd < selectionStart ? selectionEnd : selectionStart;
    const end = selectionEnd < selectionStart ? selectionStart : selectionEnd;
    return (
      isSameDay(date, start) ||
      isSameDay(date, end) ||
      (date > start && date < end)
    );
  };

  const getDayEvents = (date: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const handleEventEdit = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedEvent = {
      ...event,
      start_date: event.start_date,
      end_date: event.end_date,
    };
    onEventEdit(updatedEvent);
  };

  const handleEventDelete = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await onEventDelete(event.id);
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error(
          `Failed to delete event: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    }
  };

  const handleEventUpdate = async (event: Event) => {
    try {
      await onEventUpdate(event.id, {
        title: event.title,
        description: event.description || "",
      });
      setEditingEvent(null);
      toast.success("Event updated successfully");
    } catch (error) {
      toast.error(
        `Failed to update event: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const calculateDaysInMonth = (
    eventStart: Date,
    eventEnd: Date,
    monthDate: Date
  ) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = lastDayOfMonth(monthDate);
    const start = eventStart < monthStart ? monthStart : eventStart;
    const end = eventEnd > monthEnd ? monthEnd : eventEnd;

    if (start > monthEnd || end < monthStart) return 0;

    let days = 0;
    let currentDate = start;

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        days++;
      }
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return days;
  };

  const getMonthEvents = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const relevantEvents = events.filter((event) => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return (
        isWithinInterval(eventStart, { start, end }) ||
        isWithinInterval(eventEnd, { start, end }) ||
        (eventStart <= start && eventEnd >= end)
      );
    });

    const groups: Record<string, EventGroup> = {};
    relevantEvents.forEach((event) => {
      if (!groups[event.title]) {
        groups[event.title] = {
          title: event.title,
          color: event.user_color,
          monthlyDays: {},
          events: [],
        };
      }

      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);

      // Only calculate days for current month
      const currentMonthDays = calculateDaysInMonth(
        eventStart,
        eventEnd,
        currentDate
      );
      if (currentMonthDays > 0) {
        const monthKey = format(currentDate, "MMMM");
        groups[event.title].monthlyDays[monthKey] =
          (groups[event.title].monthlyDays[monthKey] || 0) + currentMonthDays;
      }

      groups[event.title].events.push(event);
    });

    return Object.values(groups).sort((a, b) => {
      const aTotalDays = Object.values(a.monthlyDays).reduce(
        (sum, days) => sum + days,
        0
      );
      const bTotalDays = Object.values(b.monthlyDays).reduce(
        (sum, days) => sum + days,
        0
      );
      return bTotalDays - aTotalDays;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayEvents = getDayEvents(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                className={`relative
                min-h-24 p-2 border border-gray-200
                ${!isSameMonth(day, currentDate) ? "bg-gray-50" : "bg-white"}
                ${isSelected(day) ? "bg-slate-100" : ""}
                ${isToday(day) ? "border-slate-400 border-1" : ""}
                ${
                  day < new Date(new Date().setHours(0, 0, 0, 0))
                    ? "bg-gray-100"
                    : "hover:bg-gray-50 cursor-pointer"
                }
                transition-colors duration-150 ease-in-out
              `}
              >
                <span
                  className={`
                text-sm ${!isSameMonth(day, currentDate) ? "text-gray-400" : ""}
                ${isSelected(day) ? "text-slate-800" : ""}
                ${isToday(day) ? "text-slate-500 font-bold" : ""}
              `}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded group relative overflow-hidden"
                      style={{ backgroundColor: event.user_color + "40" }}
                      onClick={(e) => handleEventClick(event, e)}
                      title={event.title}
                    >
                      {editingEvent?.id === event.id ? (
                        <input
                          type="text"
                          value={editingEvent.title}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              title: e.target.value,
                            })
                          }
                          onBlur={() => handleEventUpdate(editingEvent)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleEventUpdate(editingEvent)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                          autoFocus
                        />
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate block flex-1">
                              {event.title}
                            </span>
                            <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => handleEventEdit(event, e)}
                                className="p-1 hover:bg-black/10 rounded"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleEventDelete(event, e)}
                                className="p-1 hover:bg-black/10 rounded text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`border-l transition-all duration-300 ease-in-out ${
          isEventSummaryOpen ? "w-64" : "w-8"
        }`}
      >
        <div className="flex items-start">
          <button
            onClick={() => setIsEventSummaryOpen(!isEventSummaryOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transform transition-transform duration-300"
            style={{
              transform: isEventSummaryOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronRightDouble className="w-4 h-4" />
          </button>
          <div
            className={`pl-4 transition-opacity duration-300 space-y-4 ${
              isEventSummaryOpen ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Events Summary</h3>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWeekends}
                  onChange={(e) => setIncludeWeekends(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Include weekends
                </span>
              </label>
            </div>
            <div className="space-y-2">
              {getMonthEvents().map((group) => (
                <div
                  key={group.title}
                  className="flex items-center justify-between px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: group.color + "20" }}
                  title={group.title}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-medium truncate max-w-[120px]">
                      {group.title}
                    </span>
                  </div>
                  <span className="text-sm">
                    {Object.values(group.monthlyDays)[0]}{" "}
                    {Object.values(group.monthlyDays)[0] === 1 ? "day" : "days"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedEvent.title}
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  {format(parseISO(selectedEvent.start_date), "MMM d, yyyy")}
                  {" - "}
                  {format(parseISO(selectedEvent.end_date), "MMM d, yyyy")}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.user_color }}
                  />
                  <span>{selectedEvent.user_name}</span>
                </div>
              </div>
              {selectedEvent.description && (
                <div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    handleEventEdit(selectedEvent, e);
                    setSelectedEvent(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    handleEventDelete(selectedEvent, e);
                    setSelectedEvent(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
