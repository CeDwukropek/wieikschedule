import React from "react";
import EventCard from "./EventCard";

export default function DayView({ events }) {
  return (
    <div className="space-y-4">
      {events.map((ev) => (
        <EventCard key={ev.id} ev={ev} />
      ))}
    </div>
  );
}
