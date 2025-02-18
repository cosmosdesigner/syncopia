/*
  # Calendar Schema

  1. New Tables
    - `calendars`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `calendar_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `user_name` (text)
      - `user_color` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since we're using URL-based access)
*/

-- Create calendars table
CREATE TABLE calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'New Calendar',
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  user_name text NOT NULL,
  user_color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Allow public read access to calendars"
  ON calendars
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to calendars"
  ON calendars
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX events_calendar_id_idx ON events(calendar_id);
CREATE INDEX events_start_date_idx ON events(start_date);
CREATE INDEX events_end_date_idx ON events(end_date);