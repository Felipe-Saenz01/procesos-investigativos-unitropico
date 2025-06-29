import * as React from "react";
import { DatePicker } from './form-date-picker';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';

/**
 * Ejemplos de uso del componente DatePicker
 * Este archivo muestra diferentes formas de implementar el componente
 */

// Ejemplo 1: Uso básico con estado local
export function BasicDatePickerExample() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  return (
    <DatePicker
      value={selectedDate}
      onValueChange={setSelectedDate}
      placeholder="Seleccionar fecha..."
      label="Fecha de inicio"
    />
  );
}

// Ejemplo 2: Con formulario Inertia.js
export function InertiaFormDatePickerExample() {
  const { data, setData } = useForm({
    fecha_inicio: '',
    fecha_fin: '',
    fecha_limite: ''
  });

  return (
    <div className="space-y-4">
      <DatePicker
        value={data.fecha_inicio ? new Date(data.fecha_inicio) : undefined}
        onValueChange={(date) => setData('fecha_inicio', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Inicio"
        name="fecha_inicio"
        placeholder="Seleccionar fecha de inicio..."
        required
      />

      <DatePicker
        value={data.fecha_fin ? new Date(data.fecha_fin) : undefined}
        onValueChange={(date) => setData('fecha_fin', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Fin"
        name="fecha_fin"
        placeholder="Seleccionar fecha de fin..."
        minDate={data.fecha_inicio ? new Date(data.fecha_inicio) : undefined}
        required
      />

      <DatePicker
        value={data.fecha_limite ? new Date(data.fecha_limite) : undefined}
        onValueChange={(date) => setData('fecha_limite', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha Límite"
        name="fecha_limite"
        placeholder="Seleccionar fecha límite..."
        required
      />
    </div>
  );
}

// Ejemplo 3: Con validación de rangos de fecha
export function DateRangeExample() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="space-y-4">
      <DatePicker
        value={startDate}
        onValueChange={setStartDate}
        label="Fecha de Inicio"
        placeholder="Seleccionar fecha de inicio..."
        maxDate={endDate}
        required
      />

      <DatePicker
        value={endDate}
        onValueChange={setEndDate}
        label="Fecha de Fin"
        placeholder="Seleccionar fecha de fin..."
        minDate={startDate}
        required
      />
    </div>
  );
}

// Ejemplo 4: Con estado deshabilitado
export function DisabledDatePickerExample() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [isDisabled, setIsDisabled] = React.useState(false);

  return (
    <div className="space-y-4">
      <button onClick={() => setIsDisabled(!isDisabled)}>
        {isDisabled ? 'Habilitar' : 'Deshabilitar'} DatePicker
      </button>
      
      <DatePicker
        value={selectedDate}
        onValueChange={setSelectedDate}
        label="Fecha de Nacimiento"
        placeholder="Seleccionar fecha de nacimiento..."
        disabled={isDisabled}
        maxDate={new Date()}
      />
    </div>
  );
}

// Ejemplo 5: Con fechas específicas restringidas
export function RestrictedDatesExample() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  // Fechas festivas (ejemplo)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <DatePicker
      value={selectedDate}
      onValueChange={setSelectedDate}
      label="Fecha de Evento"
      placeholder="Seleccionar fecha de evento..."
      maxDate={nextMonth}
      required
    />
  );
}

// Ejemplo 6: Para formularios de proyectos
export function ProjectDatePickerExample() {
  const { data, setData } = useForm({
    fecha_inicio_proyecto: '',
    fecha_fin_proyecto: '',
    fecha_entrega: ''
  });

  return (
    <div className="space-y-4">
      <DatePicker
        value={data.fecha_inicio_proyecto ? new Date(data.fecha_inicio_proyecto) : undefined}
        onValueChange={(date) => setData('fecha_inicio_proyecto', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Inicio del Proyecto"
        name="fecha_inicio_proyecto"
        placeholder="Seleccionar fecha de inicio..."
        required
      />

      <DatePicker
        value={data.fecha_fin_proyecto ? new Date(data.fecha_fin_proyecto) : undefined}
        onValueChange={(date) => setData('fecha_fin_proyecto', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Fin del Proyecto"
        name="fecha_fin_proyecto"
        placeholder="Seleccionar fecha de fin..."
        minDate={data.fecha_inicio_proyecto ? new Date(data.fecha_inicio_proyecto) : undefined}
        required
      />

      <DatePicker
        value={data.fecha_entrega ? new Date(data.fecha_entrega) : undefined}
        onValueChange={(date) => setData('fecha_entrega', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Entrega"
        name="fecha_entrega"
        placeholder="Seleccionar fecha de entrega..."
        minDate={data.fecha_fin_proyecto ? new Date(data.fecha_fin_proyecto) : undefined}
        required
      />
    </div>
  );
}

// Ejemplo 7: Para registro histórico de productos ya entregados
export function HistoricalRecordExample() {
  const { data, setData } = useForm({
    fecha_entrega_real: '',
    fecha_registro: '',
    fecha_planeacion_original: ''
  });

  return (
    <div className="space-y-4">
      <DatePicker
        value={data.fecha_planeacion_original ? new Date(data.fecha_planeacion_original) : undefined}
        onValueChange={(date) => setData('fecha_planeacion_original', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Planeación Original"
        name="fecha_planeacion_original"
        placeholder="Seleccionar fecha de planeación original..."
        required
      />

      <DatePicker
        value={data.fecha_entrega_real ? new Date(data.fecha_entrega_real) : undefined}
        onValueChange={(date) => setData('fecha_entrega_real', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Entrega Real"
        name="fecha_entrega_real"
        placeholder="Seleccionar fecha de entrega real..."
        minDate={data.fecha_planeacion_original ? new Date(data.fecha_planeacion_original) : undefined}
        required
      />

      <DatePicker
        value={data.fecha_registro ? new Date(data.fecha_registro) : undefined}
        onValueChange={(date) => setData('fecha_registro', date ? format(date, 'yyyy-MM-dd') : '')}
        label="Fecha de Registro en Sistema"
        name="fecha_registro"
        placeholder="Seleccionar fecha de registro..."
        required
      />
    </div>
  );
} 