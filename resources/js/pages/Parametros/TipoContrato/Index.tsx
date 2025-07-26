import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface TipoContrato {
  id: number;
  nombre: string;
  numero_periodos: number;
}

interface Props {
  tipos: TipoContrato[];
}

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Tipo de Contrato', href: route('parametros.tipo-contrato.index') },
];

export default function Index({ tipos }: Props) {
  const { delete: destroy, processing } = useForm();
  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tipo de contrato?')) {
      destroy(route('parametros.tipo-contrato.destroy', id));
    }
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tipo de Contrato" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <div className='flex flex-row items-center justify-between p-5'>
            <h1 className='text-2xl font-bold'>Tipo de Contrato</h1>
            <Link href={route('parametros.tipo-contrato.create')} prefetch>
              <Button><Plus className="h-4 w-4 mr-1" />Nuevo Tipo de Contrato</Button>
            </Link>
          </div>
          <div className='p-5'>
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Número de Periodos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tipos.map((tipo) => (
                      <TableRow key={tipo.id}>
                        <TableCell>{tipo.nombre}</TableCell>
                        <TableCell>{tipo.numero_periodos}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={route('parametros.tipo-contrato.edit', tipo.id)}><Edit className="h-4 w-4 mr-1" /></Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(tipo.id)} disabled={processing}>
                              <Trash2 className="h-4 w-4 mr-1" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 