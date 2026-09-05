import React from "react";
import SlotChoiceCard from "./SlotChoiceCard";

export default function SlotChoicesMessage({
  message,
  addingEventId,
  addedEventIds,
  slotErrors,
  onAddSlot,
}) {
  const slots = Array.isArray(message?.payload?.data?.slots)
    ? message.payload.data.slots
    : [];

  return (
    <div className="space-y-2">
      <div className="whitespace-pre-wrap">{message.text}</div>

      {slots.map((slot, index) => {
        const eventId = String(slot?.event_id || "").trim();
        const slotKey = eventId || `slot-${index}`;

        return (
          <SlotChoiceCard
            key={slotKey}
            slot={slot}
            isAdding={Boolean(eventId) && addingEventId === eventId}
            isAdded={Boolean(eventId) && addedEventIds.has(eventId)}
            error={
              eventId ? slotErrors[eventId] : "Brak event_id dla tego slotu."
            }
            onAdd={onAddSlot}
          />
        );
      })}
    </div>
  );
}
