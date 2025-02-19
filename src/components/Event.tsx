import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Database } from "../lib/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventProps {
  event: Event;
  isEditing: boolean;
  onEdit: (event: Event, e: React.MouseEvent) => void;
  onDelete: (event: Event, e: React.MouseEvent) => void;
  onUpdate: (event: Event) => void;
  onClick: (event: Event, e: React.MouseEvent) => void;
}

export function Event({
  event,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
  onClick,
}: EventProps) {
  return (
    <div
      className="text-xs p-1 rounded group relative overflow-hidden"
      style={{ backgroundColor: event.user_color + "40" }}
      onClick={(e) => onClick(event, e)}
      title={event.title}
    >
      {isEditing ? (
        <input
          type="text"
          value={event.title}
          onChange={(e) => onUpdate({ ...event, title: e.target.value })}
          onBlur={() => onUpdate(event)}
          onKeyDown={(e) => e.key === "Enter" && onUpdate(event)}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
          autoFocus
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate block flex-1">{event.title}</span>
            <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => onEdit(event, e)}
                className="p-1 hover:bg-black/10 rounded"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => onDelete(event, e)}
                className="p-1 hover:bg-black/10 rounded text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
