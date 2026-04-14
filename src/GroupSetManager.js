import React, { useState } from "react";
import { Plus, MoreVertical, Copy, Trash2 } from "lucide-react";

export default function GroupSetManager({
  activeGroupSetId,
  activeGroupSetName,
  groupSetOptions = [],
  onGroupSetChange,
  onCreateGroupSet,
  onRenameActiveGroupSet,
  onDeleteActiveGroupSet,
  compact = false,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canDelete = groupSetOptions.length > 1;

  const inputClass =
    "px-3 py-1.5 bg-neutral-900 text-gray-300 border border-neutral-800 text-sm rounded";

  const iconButtonClass =
    "p-2 rounded hover:bg-neutral-700 text-gray-300 hover:text-white transition-colors w-9 h-9 flex items-center justify-center";

  const handleCreateClick = () => {
    if (newSetName.trim()) {
      onCreateGroupSet?.(newSetName);
      setNewSetName("");
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateClick();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewSetName("");
    }
  };

  // Mobile compact layout
  if (compact) {
    return (
      <div className="space-y-2">
        <label className="text-xs text-gray-400">Zestaw grup</label>
        <div className="flex gap-2">
          <select
            value={activeGroupSetId}
            onChange={(e) => onGroupSetChange?.(e.target.value)}
            className={`${inputClass} flex-1`}
          >
            {groupSetOptions.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>

          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className={iconButtonClass}
              type="button"
              title="Utwórz nowy zestaw"
            >
              <Plus size={18} />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsCreating(false);
                setNewSetName("");
              }}
              className={iconButtonClass}
              type="button"
              title="Anuluj"
            >
              ✕
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={iconButtonClass}
              type="button"
              title="Zarządzaj zestawem"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50 min-w-max">
                <button
                  onClick={() => {
                    const newName = prompt(
                      "Nowa nazwa zestawu:",
                      activeGroupSetName,
                    );
                    if (newName !== null && newName.trim()) {
                      onRenameActiveGroupSet?.(newName);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors text-sm flex items-center gap-2"
                  type="button"
                >
                  <Copy size={16} /> Zmień nazwę
                </button>

                <button
                  onClick={() => {
                    onDeleteActiveGroupSet?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                  type="button"
                  disabled={!canDelete}
                >
                  <Trash2 size={16} /> Usuń
                </button>
              </div>
            )}
          </div>
        </div>

        {isCreating && (
          <input
            type="text"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nazwa nowego zestawu"
            className={inputClass}
            autoFocus
          />
        )}

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex items-center gap-2">
      <select
        value={activeGroupSetId}
        onChange={(e) => onGroupSetChange?.(e.target.value)}
        className={inputClass}
      >
        {groupSetOptions.map((set) => (
          <option key={set.id} value={set.id}>
            {set.name}
          </option>
        ))}
      </select>

      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className={iconButtonClass}
          type="button"
          title="Utwórz nowy zestaw"
        >
          <Plus size={18} />
        </button>
      ) : (
        <button
          onClick={() => {
            setIsCreating(false);
            setNewSetName("");
          }}
          className={iconButtonClass}
          type="button"
          title="Anuluj"
        >
          ✕
        </button>
      )}

      {isCreating && (
        <input
          type="text"
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nazwa"
          className={`${inputClass} w-32`}
          autoFocus
        />
      )}

      {isCreating && (
        <button
          onClick={handleCreateClick}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm transition-colors"
          type="button"
        >
          Utwórz
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={iconButtonClass}
          type="button"
          title="Zarządzaj zestawem"
        >
          <MoreVertical size={18} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50 min-w-max">
            <button
              onClick={() => {
                const newName = prompt(
                  "Nowa nazwa zestawu:",
                  activeGroupSetName,
                );
                if (newName !== null && newName.trim()) {
                  onRenameActiveGroupSet?.(newName);
                }
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors text-sm flex items-center gap-2"
              type="button"
            >
              <Copy size={16} /> Zmień nazwę
            </button>

            <button
              onClick={() => {
                onDeleteActiveGroupSet?.();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={!canDelete}
            >
              <Trash2 size={16} /> Usuń
            </button>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
