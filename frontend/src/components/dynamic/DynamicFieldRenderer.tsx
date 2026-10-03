import React from "react";
import type { VerticalFieldSpec } from "../../types/verticalRegistry";

interface DynamicFieldRendererProps {
  field: VerticalFieldSpec;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val: any = e.target.value;
    if (field.type === "number") {
      val = val === "" ? "" : Number(val);
    }
    onChange(field.name, val);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field.name, e.target.checked);
  };

  const inputBaseStyle =
    "w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500";
  const borderStyle = error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-indigo-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {field.type === "number" && field.validation && (
          <span className="text-[10px] text-slate-400">
            {field.validation.min !== undefined ? `Min: ${field.validation.min}` : ""}
            {field.validation.max !== undefined ? ` Max: ${field.validation.max}` : ""}
          </span>
        )}
      </div>

      {field.type === "select" ? (
        <select
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className={`${inputBaseStyle} ${borderStyle}`}
        >
          <option value="">Select {field.label}...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-600">{field.placeholder || `Enable ${field.label}`}</span>
        </label>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className={`${inputBaseStyle} ${borderStyle}`}
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          placeholder={field.placeholder || `Enter ${field.label}...`}
          onChange={handleChange}
          disabled={disabled}
          min={field.validation?.min}
          max={field.validation?.max}
          className={`${inputBaseStyle} ${borderStyle}`}
        />
      )}

      {error && <span className="text-[11px] text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};
