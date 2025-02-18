import { Database } from "./database.types";
import { supabase } from "./supabase";

type Calendar = Database["public"]["Tables"]["calendars"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
type EventCreate = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export const calendarApi = {
  async create(name: string = "New Calendar"): Promise<Calendar> {
    const { data, error } = await supabase
      .from("calendars")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<Calendar> {
    const { data, error } = await supabase
      .from("calendars")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Calendar>): Promise<Calendar> {
    const { data, error } = await supabase
      .from("calendars")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("calendars").delete().eq("id", id);

    if (error) throw error;
  },
};

export const eventApi = {
  async create(event: EventCreate): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(calendarId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select()
      .eq("calendar_id", calendarId);

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: EventUpdate): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
  },
};
