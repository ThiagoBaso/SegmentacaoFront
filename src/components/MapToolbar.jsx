import { useState } from "react";
import "./MapToolbar.scss";

const TOOLS = [
  {
    id: "segment",
    label: "Segmentar",
    sublabel: "área",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "drag",
    label: "Arrastar",
    sublabel: "pontos",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4.93 4.93l2.12 2.12M12.95 12.95l2.12 2.12M4.93 15.07l2.12-2.12M12.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "confirm",
    label: "[E]Confirmar",
    sublabel: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 10.5l4.5 4.5 7.5-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "reset",
    label: "[R]Reset",
    sublabel: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 10a6 6 0 1 0 1.2-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 5.5V10h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    danger: true,
  },
  {
    id: "delete",
    label: "[Z]Excluir",
    sublabel: "talhão",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4h8M8 4V3h4v1M5 4l1 12h8l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8v5M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    danger: true,
  },
  {
    id: "save",
    label: "[S]Salvar",
    sublabel: "talhões",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 10a6 6 0 1 0 1.2-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 5.5V10h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    danger: true,
  },
];

// Toggle tools (activate/deactivate on click)
const TOGGLE_TOOLS = ["segment", "drag"];

export default function MapToolbar({
  onSegment,
  onDrag,
  onConfirm,
  onDelete,
  onReset,
  onSave,
}) {
  const [activeTool, setActiveTool] = useState('0');

  const callbacks = { segment: onSegment, drag: onDrag, confirm: onConfirm, delete: onDelete, reset: onReset, save: onSave};

  const handleClick = (toolId) => {
    if (TOGGLE_TOOLS.includes(toolId)) {
      const next = activeTool === toolId ? null : toolId;
      setActiveTool(next);
      callbacks[toolId]?.(next === toolId);
    } else {
      callbacks[toolId]?.();
    }
  };

  return (
    <div className="map-toolbar">
      <div className="map-toolbar__track" />
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={[
            "map-toolbar__btn",
            activeTool === tool.id && "map-toolbar__btn--active",
            tool.danger && "map-toolbar__btn--danger",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => handleClick(tool.id)}
          title={tool.sublabel ? `${tool.label} ${tool.sublabel}` : tool.label}
        >
          <span className="map-toolbar__btn-icon">{tool.icon}</span>
          <span className="map-toolbar__btn-label">
            {tool.label}
            {tool.sublabel && (
              <span className="map-toolbar__btn-sublabel">{tool.sublabel}</span>
            )}
          </span>
          {activeTool === tool.id && <span className="map-toolbar__btn-pip" />}
        </button>
      ))}
    </div>
  );
}
