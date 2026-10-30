"use client";

import { Check, ChevronDown } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  id?: string;
  name?: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  variant?: "default" | "accent";
  disabled?: boolean;
};

export function CustomSelect({
  id,
  name,
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  variant = "default",
  disabled = false,
}: CustomSelectProps) {
  const generatedId = useId().replaceAll(":", "");
  const triggerId = id || `custom-select-${generatedId}`;
  const listId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function focusOption(index: number) {
    window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLButtonElement>(`[data-option-index="${index}"]`)?.focus();
    });
  }

  function moveActive(direction: 1 | -1) {
    const next = (activeIndex + direction + options.length) % options.length;
    setActiveIndex(next);
    focusOption(next);
  }

  function choose(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    window.requestAnimationFrame(() => document.getElementById(triggerId)?.focus());
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      document.getElementById(triggerId)?.focus();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
        focusOption(selectedIndex);
      } else {
        moveActive(event.key === "ArrowDown" ? 1 : -1);
      }
      return;
    }
    if (open && event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      focusOption(0);
    }
    if (open && event.key === "End") {
      event.preventDefault();
      const last = options.length - 1;
      setActiveIndex(last);
      focusOption(last);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`custom-select custom-select--${variant}${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      onKeyDown={handleKeyDown}
    >
      {name && <input type="hidden" name={name} value={value}/>}
      <button
        id={triggerId}
        className="custom-select__trigger"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => {
          const nextOpen = !open;
          setActiveIndex(selectedIndex);
          setOpen(nextOpen);
          if (nextOpen) focusOption(selectedIndex);
        }}
      >
        <span>{selected?.label ?? "Select"}</span>
        <ChevronDown aria-hidden="true"/>
      </button>
      {open && (
        <div className="custom-select__menu" id={listId} role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`custom-select__option${option.value === value ? " is-selected" : ""}`}
              data-option-index={index}
              key={option.value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option.value)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check aria-hidden="true"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
