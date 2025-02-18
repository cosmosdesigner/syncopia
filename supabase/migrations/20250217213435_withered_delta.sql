/*
  # Enable real-time functionality for calendar app

  1. Changes
    - Enable real-time for events table
    - Enable real-time for calendars table
    - Add publication for real-time changes
    - Add replication identifiers for real-time tracking

  2. Security
    - Maintains existing RLS policies
    - Only enables real-time for specific tables
*/

-- Enable real-time for specific tables
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE calendars REPLICA IDENTITY FULL;

-- Create publication for real-time changes
CREATE PUBLICATION supabase_realtime FOR TABLE events, calendars;

-- Enable real-time for all changes (insert, update, delete)
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE calendars;