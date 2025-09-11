import { Head, Link, Form, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Employee {
  id: number;
  employee_code: string;
  name: string;
}

interface Paged<T> { data: T[]; }

interface PageProps {
  employees: Paged<Employee>;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'HR', href: '/hr' },
  { title: 'Employees', href: '/hr/employees' },
  { title: 'Personal Information', href: '/hr/employees' },
];

export default function EmployeesIndex({ employees }: PageProps) {
  const { data, setData, post, processing, reset, errors } = useForm({
    user_id: '',
    employee_code: '',
    name: '',
    date_of_birth: '',
    phone: '',
    address: '',
    emergency_phone: '',
    cnic: '',
    role: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/hr/employees', {
      onSuccess: () => reset('employee_code', 'name'),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Employees" />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Create Employee</h3>
            <p className="mb-4 text-sm text-neutral-500">Personal Information</p>
            <Form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>User ID</Label>
                  <Input value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} placeholder="Existing User ID" />
                  {errors.user_id && <p className="text-xs text-red-500">{errors.user_id}</p>}
                </div>
                <div>
                  <Label>Employee ID</Label>
                  <Input value={data.employee_code} onChange={(e) => setData('employee_code', e.target.value)} placeholder="E.g. EMP-001" />
                  {errors.employee_code && <p className="text-xs text-red-500">{errors.employee_code}</p>}
                </div>
                <div className="col-span-2">
                  <Label>Employee Name</Label>
                  <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
                </div>
                <div>
                  <Label>Emergency Phone</Label>
                  <Input value={data.emergency_phone} onChange={(e) => setData('emergency_phone', e.target.value)} />
                </div>
                <div>
                  <Label>CNIC</Label>
                  <Input value={data.cnic} onChange={(e) => setData('cnic', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Role</Label>
                  <Input value={data.role} onChange={(e) => setData('role', e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={processing}>Save</Button>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Employees</h3>
            <div className="space-y-2">
              {employees.data.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border border-sidebar-border/70 p-2">
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-neutral-500">{e.employee_code}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/hr/employees/${e.id}`}><Button variant="secondary">Edit</Button></Link>
                    <Button variant="destructive" onClick={() => router.delete(`/hr/employees/${e.id}`)}>Delete</Button>
                  </div>
                </div>
              ))}
              {employees.data.length === 0 && <div className="text-sm text-neutral-500">No employees yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
