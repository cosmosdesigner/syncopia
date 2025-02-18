/* eslint-disable no-useless-catch */
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { calendarApi, eventApi } from "../lib/api";
import { Database } from "../lib/database.types";
import { supabase } from "../lib/supabase";

type Calendar = Database["public"]["Tables"]["calendars"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];

interface UserPreferences {
  name: string;
  color: string;
}

export function useCalendar(calendarId: string) {
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() => {
    const saved = Cookies.get(`calendar_${calendarId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
  });

  useEffect(() => {
    // Save user preferences to cookie
    Cookies.set(`calendar_${calendarId}`, JSON.stringify(userPrefs), {
      expires: 365,
    });
  }, [userPrefs, calendarId]);

  useEffect(() => {
    // Fetch calendar and initial events
    const fetchCalendar = async () => {
      try {
        const calendar = await calendarApi.get(calendarId);
        setCalendar(calendar);

        const events = await eventApi.getAll(calendarId);
        setEvents(events);
      } catch (error) {
        toast.error(
          `Failed to load calendar data: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    };

    fetchCalendar();

    // Subscribe to real-time updates
    const eventsSubscription = supabase
      .channel("events_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `calendar_id=eq.${calendarId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [...prev, payload.new as Event]);
          } else if (payload.eventType === "DELETE") {
            setEvents((prev) =>
              prev.filter((event) => event.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((event) =>
                event.id === payload.new.id ? (payload.new as Event) : event
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, [calendarId]);

  const updateCalendarName = async (name: string) => {
    try {
      const updated = await calendarApi.update(calendarId, { name });
      setCalendar(updated);
      toast.success("Calendar name updated");
    } catch (error) {
      toast.error(
        `Failed to update calendar name: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const addEvent = async (
    title: string,
    description: string,
    start: Date,
    end: Date
  ) => {
    try {
      const event = await eventApi.create({
        id: uuidv4(),
        calendar_id: calendarId,
        title,
        description,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
        user_name: userPrefs.name,
        user_color: userPrefs.color,
      });
      setEvents((prev) => [...prev, event]);
      return event;
    } catch (error) {
      throw error;
    }
  };

  const updateEvent = async (
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      start_date: Date;
      end_date: Date;
    }>
  ) => {
    try {
      const formattedUpdates = {
        ...updates,
        start_date: updates.start_date
          ? format(updates.start_date, "yyyy-MM-dd")
          : undefined,
        end_date: updates.end_date
          ? format(updates.end_date, "yyyy-MM-dd")
          : undefined,
      };
      const event = await eventApi.update(id, formattedUpdates);
      setEvents((prev) => prev.map((e) => (e.id === id ? event : e)));
      return event;
    } catch (error) {
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventApi.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPrefs((prev) => ({ ...prev, ...prefs }));
  };

  return {
    calendar,
    events,
    userPrefs,
    updateCalendarName,
    addEvent,
    updateEvent,
    deleteEvent,
    updateUserPreferences,
  };
}
