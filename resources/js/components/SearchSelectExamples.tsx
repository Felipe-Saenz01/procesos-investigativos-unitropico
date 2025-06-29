import * as React from "react";
import { SearchSelect } from './form-search-select';
import { useForm } from '@inertiajs/react';

/**
 * Ejemplos de uso del componente SearchSelect
 * Este archivo muestra diferentes formas de implementar el componente
 */

// Ejemplo 1: Uso básico con estado local
export function BasicExample() {
  const [selectedValue, setSelectedValue] = React.useState<string | number>('');

  const options = [
    { value: 1, label: "Opción 1" },
    { value: 2, label: "Opción 2" },
    { value: 3, label: "Opción 3" },
  ];

  return (
    <SearchSelect
      options={options}
      value={selectedValue}
      onValueChange={setSelectedValue}
      placeholder="Seleccionar opción..."
    />
  );
}

// Ejemplo 2: Con formulario Inertia.js
export function InertiaFormExample() {
  const { data, setData } = useForm({
    user_id: '',
    project_id: '',
    category_id: ''
  });

  const userOptions = [
    { value: 1, label: "Juan Pérez" },
    { value: 2, label: "María García" },
    { value: 3, label: "Carlos López" },
  ];

  const projectOptions = [
    { value: 1, label: "Proyecto A" },
    { value: 2, label: "Proyecto B" },
    { value: 3, label: "Proyecto C" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label>Usuario:</label>
        <SearchSelect
          options={userOptions}
          value={data.user_id}
          onValueChange={(value) => setData('user_id', String(value))}
          name="user_id"
          placeholder="Seleccionar usuario..."
          searchPlaceholder="Buscar usuario..."
        />
      </div>

      <div>
        <label>Proyecto:</label>
        <SearchSelect
          options={projectOptions}
          value={data.project_id}
          onValueChange={(value) => setData('project_id', String(value))}
          name="project_id"
          placeholder="Seleccionar proyecto..."
          searchPlaceholder="Buscar proyecto..."
        />
      </div>
    </div>
  );
}

// Ejemplo 3: Con datos dinámicos desde props
interface DynamicExampleProps {
  users: Array<{ id: number; name: string; email: string }>;
  selectedUserId?: number;
  onUserChange: (userId: number) => void;
}

export function DynamicExample({ users, selectedUserId, onUserChange }: DynamicExampleProps) {
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`
  }));

  return (
    <SearchSelect
      options={userOptions}
      value={selectedUserId}
      onValueChange={(value) => onUserChange(Number(value))}
      placeholder="Seleccionar usuario..."
      searchPlaceholder="Buscar por nombre o email..."
      emptyMessage="No se encontraron usuarios."
    />
  );
}

// Ejemplo 4: Con validación y estado de error
export function ValidationExample() {
  const [selectedValue, setSelectedValue] = React.useState<string | number>('');
  const [error, setError] = React.useState<string>('');

  const options = [
    { value: 'admin', label: "Administrador" },
    { value: 'user', label: "Usuario" },
    { value: 'guest', label: "Invitado" },
  ];

  const handleValueChange = (value: string | number) => {
    setSelectedValue(value);
    if (!value) {
      setError('Este campo es requerido');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <SearchSelect
        options={options}
        value={selectedValue}
        onValueChange={handleValueChange}
        placeholder="Seleccionar rol..."
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Ejemplo 5: Con estado deshabilitado
export function DisabledExample() {
  const [selectedValue, setSelectedValue] = React.useState<string | number>('');
  const [isDisabled, setIsDisabled] = React.useState(false);

  const options = [
    { value: 1, label: "Opción 1" },
    { value: 2, label: "Opción 2" },
  ];

  return (
    <div className="space-y-4">
      <button onClick={() => setIsDisabled(!isDisabled)}>
        {isDisabled ? 'Habilitar' : 'Deshabilitar'} Select
      </button>
      
      <SearchSelect
        options={options}
        value={selectedValue}
        onValueChange={setSelectedValue}
        placeholder="Seleccionar opción..."
        disabled={isDisabled}
      />
    </div>
  );
} 