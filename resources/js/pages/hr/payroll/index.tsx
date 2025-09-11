import { Head, Form, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Payroll {
  id: number;
  period_start: string;
  period_end: string;
  employee?: { id: number; name: string; employee_code?: string };
}
interface Paged<T> { data: T[] }

export default function PayrollIndex({ payrolls }: { payrolls: Paged<Payroll> }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR', href: '/hr' },
    { title: 'Payroll and Compensation', href: '/hr/payroll' },
  ];

  const { data, setData, post, put, processing, reset, errors } = useForm({
    employee_id: '',
    period_start: '',
    period_end: '',
    salary: '',
    hourly_wage: '',
    total_compensation: '',
    id: '' as any,
  });

  const [employeeLocked, setEmployeeLocked] = useState(true);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string>('');

  // Normalize ISO datetime strings to yyyy-MM-dd for date inputs
  useEffect(() => {
    if (data.period_start && data.period_start.includes('T')) {
      setData('period_start', data.period_start.slice(0, 10));
    }
    if (data.period_end && data.period_end.includes('T')) {
      setData('period_end', data.period_end.slice(0, 10));
    }
  }, [data.period_start, data.period_end]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (data.id) {
      put(`/hr/payroll/${data.id}`, { onSuccess: () => reset('id') });
    } else {
      post('/hr/payroll', { onSuccess: () => reset('salary', 'hourly_wage', 'total_compensation') });
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Payroll" />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Create Payroll</h3>
            <Form onSubmit={submit} className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Employee ID
                  {selectedEmployeeCode && (
                    <span className="ml-2 text-xs text-neutral-500">Code: {selectedEmployeeCode}</span>
                  )}
                </Label>
                <Input
                  value={data.employee_id}
                  readOnly={employeeLocked}
                  className={employeeLocked ? 'cursor-not-allowed opacity-70' : ''}
                  onChange={(e) => setData('employee_id', e.target.value)}
                />
                <div className="mt-1">
                  <button type="button" className="text-xs text-neutral-600 underline" onClick={() => setEmployeeLocked((v) => !v)}>
                    {employeeLocked ? 'Change' : 'Lock'}
                  </button>
                </div>
                {errors.employee_id && <p className="text-xs text-red-500">{errors.employee_id}</p>}
              </div>
              <div>
                <Label>Period Start</Label>
                <Input type="date" value={data.period_start} onChange={(e) => setData('period_start', e.target.value)} />
              </div>
              <div>
                <Label>Period End</Label>
                <Input type="date" value={data.period_end} onChange={(e) => setData('period_end', e.target.value)} />
              </div>
              <div>
                <Label>Salary</Label>
                <Input value={data.salary} onChange={(e) => setData('salary', e.target.value)} />
              </div>
              <div>
                <Label>Hourly Wage</Label>
                <Input value={data.hourly_wage} onChange={(e) => setData('hourly_wage', e.target.value)} />
              </div>
              <div>
                <Label>Total Compensation</Label>
                <Input value={data.total_compensation} onChange={(e) => setData('total_compensation', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Recent Payrolls</h3>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70 text-sm">
              {payrolls.data.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2">
                  <div className="flex-1">
                    <div>
                      {p.employee?.name ?? '—'}
                      {p.employee?.employee_code && (
                        <span className="ml-2 text-xs text-neutral-500">[{p.employee.employee_code}]</span>
                      )}
                    </div>
                    <div className="text-neutral-500">{(p.period_start || '').slice(0,10)} - {(p.period_end || '').slice(0,10)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md bg-neutral-800 px-2 py-1 text-white"
                      onClick={() => {
                        setSelectedEmployeeCode(p.employee?.employee_code ?? '');
                        setEmployeeLocked(true);
                        setData((prev: any) => ({
                          ...prev,
                          id: p.id,
                          employee_id: p.employee?.id ? String(p.employee.id) : '',
                          period_start: (p.period_start || '').slice(0,10),
                          period_end: (p.period_end || '').slice(0,10),
                        }));
                      }}
                    >
                      Edit
                    </button>
                    <button className="rounded-md bg-red-600 px-2 py-1 text-white" onClick={() => router.delete(`/hr/payroll/${p.id}`)}>Delete</button>
                  </div>
                </div>
              ))}
              {payrolls.data.length === 0 && <div className="p-3 text-sm text-neutral-500">No payrolls.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

