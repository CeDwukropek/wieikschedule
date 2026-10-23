import React, { useEffect, useRef, useState } from "react";
import { Check, Plus, MoreVertical, Copy, Trash2, X } from "lucide-react";

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
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);

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

  const startRename = () => {
    setRenameValue(activeGroupSetName || "");
    setIsRenaming(true);
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue("");
  };

  const commitRename = () => {
    const nextName = renameValue.trim();
    if (nextName && nextName !== activeGroupSetName) {
      onRenameActiveGroupSet?.(nextName);
    }
    cancelRename();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateClick();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewSetName("");
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  useEffect(() => {
    if (!isRenaming) return;
    renameInputRef.current?.focus();
    renameInputRef.current?.select?.();
  }, [isRenaming]);

  const handleRenameBlur = () => {
    if (!isRenaming) return;
    if (!renameValue.trim()) {
      cancelRename();
      return;
    }
    commitRename();
  };

  // Mobile compact layout
  if (compact) {
    return (
      <div className="space-y-2">
        <label className="text-xs text-gray-400">Zestaw grup</label>
        <div className="flex gap-2 items-center">
          {!isRenaming ? (
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
          ) : (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRenameBlur}
              className={`${inputClass} flex-1`}
              placeholder="Nazwa zestawu"
            />
          )}

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
                    startRename();
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

        {isRenaming && (
          <div className="flex gap-2">
            <button
              onClick={commitRename}
              className={iconButtonClass}
              type="button"
              title="Zapisz nazwę"
            >
              <Check size={18} />
            </button>

            <button
              onClick={cancelRename}
              className={iconButtonClass}
              type="button"
              title="Anuluj zmianę"
            >
              <X size={18} />
            </button>
          </div>
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
      {!isRenaming ? (
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
      ) : (
        <input
          ref={renameInputRef}
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleRenameKeyDown}
          onBlur={handleRenameBlur}
          className={`${inputClass} w-48`}
          placeholder="Nazwa zestawu"
        />
      )}

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

      {isRenaming && (
        <button
          onClick={commitRename}
          className="px-3 py-1.5 bg-lime-700 hover:bg-lime-600 text-white rounded text-sm transition-colors"
          type="button"
          title="Zapisz nazwę"
        >
          Zapisz
        </button>
      )}

      {isRenaming && (
        <button
          onClick={cancelRename}
          className={iconButtonClass}
          type="button"
          title="Anuluj zmianę"
        >
          <X size={18} />
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
                startRename();
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
