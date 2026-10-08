"use client";

export function QuantitySelect({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <select
      className="quantity-select"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label="Quantity"
    >
      {Array.from({ length: max }, (_, index) => index + 1).map((quantity) => (
        <option value={quantity} key={quantity}>{quantity}</option>
      ))}
    </select>
  );
}
