import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';

interface Grupo {
  id: number;
  nombre: string;
}
interface TipoContrato {
  id: number;
  nombre: string;
}
interface TipoVinculacion {
  id: number;
  nombre: string;
}

interface Props {
  isAdmin: boolean;
  grupos: Grupo[];
  grupoLider?: number;
  tipoContratos: TipoContrato[];
  tipoVinculaciones: TipoVinculacion[];
}

const breadcrumbs = [
  { title: 'Investigadores', href: '/investigadores' },
  { title: 'Nuevo Investigador', href: '/investigadores/create' },
];

export default function InvestigadorCreate({ isAdmin, grupos, grupoLider, tipoContratos, tipoVinculaciones }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    cedula: '',
    grupo_investigacion_id: isAdmin ? '' : grupoLider || '',
    tipo_contrato_id: '',
    tipo_vinculacion_id: '',
  });

  const tipo = isAdmin ? 'Lider Grupo' : 'Investigador';

  const grupoOptions = grupos.map(g => ({ value: g.id, label: g.nombre }));
  const contratoOptions = tipoContratos.map(tc => ({ value: tc.id, label: tc.nombre }));
  const vinculacionOptions = tipoVinculaciones.map(tv => ({ value: tv.id, label: tv.nombre }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('investigadores.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nuevo Investigador" />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-4/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Nuevo Investigador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    type='text'
                    name='name'
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    type='email'
                    name='email'
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input
                    id="cedula"
                    value={data.cedula}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setData('cedula', val);
                    }}
                    type='text'
                    name='cedula'
                    required
                    minLength={6}
                    maxLength={15}
                  />
                  {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={tipo}
                    type='text'
                    name='tipo'
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="grupo">Grupo de Investigación</Label>
                  {isAdmin ? (
                    <SearchSelect
                      options={grupoOptions}
                      value={data.grupo_investigacion_id}
                      onValueChange={value => setData('grupo_investigacion_id', value)}
                      placeholder="Selecciona un grupo..."
                      name="grupo_investigacion_id"
                    />
                  ) : (
                    <Input
                      value={grupos.find(g => g.id === grupoLider)?.nombre || ''}
                      type='text'
                      disabled
                    />
                  )}
                  {errors.grupo_investigacion_id && <p className="text-red-500 text-xs mt-1">{errors.grupo_investigacion_id}</p>}
                </div>
                <div>
                  <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                  <SearchSelect
                    options={contratoOptions}
                    value={data.tipo_contrato_id}
                    onValueChange={value => setData('tipo_contrato_id', String(value))}
                    placeholder="Selecciona un tipo de contrato..."
                    name="tipo_contrato_id"
                  />
                  {errors.tipo_contrato_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_contrato_id}</p>}
                </div>
                <div>
                  <Label htmlFor="tipo_vinculacion">Tipo de Vinculación</Label>
                  <SearchSelect
                    options={vinculacionOptions}
                    value={data.tipo_vinculacion_id}
                    onValueChange={value => setData('tipo_vinculacion_id', String(value))}
                    placeholder="Selecciona un tipo de vinculación..."
                    name="tipo_vinculacion_id"
                  />
                  {errors.tipo_vinculacion_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_vinculacion_id}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button type="submit" disabled={processing}>Crear</Button>
              <Button asChild variant="secondary">
                <Link href={route('investigadores.index')}>Cancelar</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 