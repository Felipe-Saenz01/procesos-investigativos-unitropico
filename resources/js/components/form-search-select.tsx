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
  className
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
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
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
                  {option.label}
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