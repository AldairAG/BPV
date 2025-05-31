import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "./Button";

interface DatePickerWithRangeProps {
  onChange: (start: Date | null, end: Date | null) => void;
  initialDateFrom?: Date;
  initialDateTo?: Date;
  className?: string;
}

export function DatePickerWithRange({
  onChange,
  initialDateFrom = new Date(),
  initialDateTo = new Date(),
  className
}: DatePickerWithRangeProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialDateFrom);
  const [endDate, setEndDate] = useState<Date | null>(initialDateTo);
  const [isOpen, setIsOpen] = useState(false);

  // Predefined date ranges
  const dateRanges = [
    { name: "Hoy", getRange: () => {
      const today = new Date();
      return { start: today, end: today };
    }},
    { name: "Ayer", getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }},
    { name: "Esta semana", getRange: () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: today };
    }},
    { name: "Últimos 7 días", getRange: () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      return { start: sevenDaysAgo, end: today };
    }},
    { name: "Este mes", getRange: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfMonth, end: today };
    }},
    { name: "Últimos 30 días", getRange: () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);
      return { start: thirtyDaysAgo, end: today };
    }},
    { name: "Últimos 90 días", getRange: () => {
      const today = new Date();
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 89);
      return { start: ninetyDaysAgo, end: today };
    }}
  ];

  // Notify parent component when dates change
  useEffect(() => {
    onChange(startDate, endDate);
  }, [startDate, endDate, onChange]);

  // Update start and end dates
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newStartDate = new Date(e.target.value);
      setStartDate(newStartDate);
      // If start date is after end date, update end date
      if (endDate && newStartDate > endDate) {
        setEndDate(newStartDate);
      }
    } else {
      setStartDate(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newEndDate = new Date(e.target.value);
      setEndDate(newEndDate);
      // If end date is before start date, update start date
      if (startDate && newEndDate < startDate) {
        setStartDate(newEndDate);
      }
    } else {
      setEndDate(null);
    }
  };

  // Apply predefined range
  const applyDateRange = (rangeName: string) => {
    const range = dateRanges.find(r => r.name === rangeName);
    if (range) {
      const { start, end } = range.getRange();
      setStartDate(start);
      setEndDate(end);
    }
    setIsOpen(false);
  };

  // Format date for display
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  // Create a display string for the date range
  const displayText = startDate && endDate
    ? startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]
      ? `${formatDateDisplay(startDate)}`
      : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
    : "Seleccionar fechas";

  return (
    <div className={`relative ${className}`}>
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {displayText}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-auto min-w-[300px] rounded-md border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Fecha inicial
              </label>
              <input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ""}
                onChange={handleStartDateChange}
                className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Fecha final
              </label>
              <input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ""}
                onChange={handleEndDateChange}
                className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rangos predefinidos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.name}
                  onClick={() => applyDateRange(range.name)}
                  className="text-sm py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
                >
                  {range.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 space-x-2">
            <Button 
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}