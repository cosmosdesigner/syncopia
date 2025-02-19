import React from "react";
import { ChevronRight as ChevronRightDouble } from "lucide-react";
import { Database } from "../lib/database.types";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  lastDayOfMonth,
} from "date-fns";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventGroup {
  title: string;
  color: string;
  monthlyDays: { [key: string]: number };
  events: Event[];
}

interface EventSummaryProps {
  events: Event[];
  currentDate: Date;
  isOpen: boolean;
  includeWeekends: boolean;
  onToggle: () => void;
  onWeekendToggle: (include: boolean) => void;
}

export function EventSummary({
  events,
  currentDate,
  isOpen,
  includeWeekends,
  onToggle,
  onWeekendToggle,
}: EventSummaryProps) {
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
    <div
      className={`border-l transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-8"
      }`}
    >
      <div className="flex items-start">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-full transform transition-transform duration-300"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronRightDouble className="w-4 h-4" />
        </button>
        <div
          className={`pl-4 transition-opacity duration-300 space-y-4 ${
            isOpen ? "opacity-100" : "opacity-0 hidden"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Events Summary</h3>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeWeekends}
                onChange={(e) => onWeekendToggle(e.target.checked)}
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
  );
}
