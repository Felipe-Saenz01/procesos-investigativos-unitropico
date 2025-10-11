import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date;
  onValueChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

/**
 * Función helper para crear una fecha sin problemas de zona horaria
 * @param dateString - String de fecha en formato YYYY-MM-DD
 * @returns Date object sin problemas de zona horaria
 */
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Función helper para convertir Date a string sin problemas de zona horaria
 * @param date - Date object
 * @returns String en formato YYYY-MM-DD
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Componente DatePicker - Selector de fecha reutilizable
 * 
 * @example
 * // Uso básico
 * <DatePicker
 *   value={selectedDate}
 *   onValueChange={setSelectedDate}
 *   placeholder="Seleccionar fecha..."
 * />
 * 
 * @example
 * // Con formulario Inertia
 * <DatePicker
 *   value={data.fecha_limite ? createLocalDate(data.fecha_limite) : undefined}
 *   onValueChange={(date) => setData('fecha_limite', date ? formatDateToString(date) : '')}
 *   name="fecha_limite"
 *   placeholder="Seleccionar fecha límite..."
 * />
 * 
 * @example
 * // Para registro histórico (permite fechas pasadas)
 * <DatePicker
 *   value={data.fecha_entrega_real ? createLocalDate(data.fecha_entrega_real) : undefined}
 *   onValueChange={(date) => setData('fecha_entrega_real', date ? formatDateToString(date) : '')}
 *   name="fecha_entrega_real"
 *   placeholder="Seleccionar fecha de entrega real..."
 * />
 */
export function DatePicker({
  value,
  onValueChange,
  placeholder = "Seleccionar fecha...",
  label,
  name,
  disabled = false,
  className,
  minDate,
  maxDate,
  required = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, "PPP", { locale: es })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onValueChange(date)
              setOpen(false)
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ? formatDateToString(value) : ''}
        />
      )}
    </div>
  )
}

// Exportar las funciones helper para uso externo
export { createLocalDate, formatDateToString }

// Componente legacy para mantener compatibilidad
export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-2">
      <DatePicker
        value={date}
        onValueChange={setDate}
        placeholder="Seleccionar fecha..."
        label="Fecha de ejemplo"
      />
      {date && (
        <p className="text-sm text-muted-foreground">
          Fecha seleccionada: {format(date, "PPP", { locale: es })}
        </p>
      )}
    </div>
  )
}
