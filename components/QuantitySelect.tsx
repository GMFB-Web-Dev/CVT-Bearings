"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function QuantitySelect({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div className="quantity-picker" ref={rootRef}>
      <button
        className="quantity-trigger"
        type="button"
        aria-label={`Quantity: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{value}</span><ChevronDown size={14} aria-hidden="true"/>
      </button>
      {open && <div className="quantity-options" id={listId} role="listbox" aria-label="Choose quantity">
        <small>Quantity</small>
        {Array.from({ length: max }, (_, index) => index + 1).map((quantity) => (
          <button
            type="button"
            role="option"
            aria-selected={quantity === value}
            className={quantity === value ? "selected" : ""}
            onClick={() => { onChange(quantity); setOpen(false); }}
            key={quantity}
          >
            <span>{quantity}</span>{quantity === value && <Check size={14} aria-hidden="true"/>}
          </button>
        ))}
      </div>}
    </div>
  );
}
