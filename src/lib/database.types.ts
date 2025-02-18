export interface Database {
  public: {
    Tables: {
      calendars: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          calendar_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          user_name: string;
          user_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          user_name: string;
          user_color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          calendar_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          user_name?: string;
          user_color?: string;
          created_at?: string;
        };
      };
    };
  };
}