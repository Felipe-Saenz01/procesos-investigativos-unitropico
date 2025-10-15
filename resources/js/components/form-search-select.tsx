import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  value: string | number;
  label: string;
}

interface SearchSelectProps {
  options: Option[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  side?: 'top' | 'bottom';
}

/**
 * Componente SearchSelect - Select con búsqueda reutilizable
 * 
 * @example
 * // Uso básico
 * <SearchSelect
 *   options={[
 *     { value: 1, label: "Opción 1" },
 *     { value: 2, label: "Opción 2" }
 *   ]}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   placeholder="Seleccionar..."
 * />
 * 
 * @example
 * // Con formulario Inertia
 * <SearchSelect
 *   options={userOptions}
 *   value={data.user_id}
 *   onValueChange={(value) => setData('user_id', String(value))}
 *   name="user_id"
 *   placeholder="Seleccionar usuario..."
 *   searchPlaceholder="Buscar usuario..."
 * />
 * 
 * @example
 * // Con orientación hacia arriba (útil para elementos al final del formulario)
 * <SearchSelect
 *   options={elementOptions}
 *   value={data.elemento_id}
 *   onValueChange={(value) => setData('elemento_id', String(value))}
 *   placeholder="Seleccionar elemento..."
 *   side="top"
 * />
 * 
 * @example
 * // Orientación hacia abajo (comportamiento por defecto)
 * <SearchSelect
 *   options={userOptions}
 *   value={data.user_id}
 *   onValueChange={(value) => setData('user_id', String(value))}
 *   placeholder="Seleccionar usuario..."
 *   side="bottom" // Opcional, es el valor por defecto
 * />
 */
export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  name,
  disabled = false,
  className,
  side = 'bottom'
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => {
    // Convertir ambos valores a string para comparación consistente
    const optionValue = String(option.value);
    const currentValue = String(value);
    return optionValue === currentValue;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left overflow-hidden", className)}
          disabled={disabled}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side={side} sideOffset={4} avoidCollisions={false}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span className="whitespace-normal break-words pr-6">
                    {option.label}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ""}
        />
      )}
    </Popover>
  )
}

// Componente legacy para mantener compatibilidad
export function ComboboxDemo() {
  const [value, setValue] = React.useState("")
  
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ]

  return (
    <SearchSelect
      options={frameworks}
      value={value}
      onValueChange={(value) => setValue(String(value))}
      placeholder="Seleccionar framework..."
      searchPlaceholder="Buscar framework..."
    />
  )
}