import { Head, Form, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Record {
  id: number;
  work_date: string;
  status: string;
  employee?: { id: number; name: string; employee_code?: string };
}

interface Paged<T> { data: T[] }

export default function AttendanceIndex({ records }: { records: Paged<Record> }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR', href: '/hr' },
    { title: 'Time and Attendance', href: '/hr/attendance' },
  ];

  const { data, setData, post, put, processing, errors, reset } = useForm({
    employee_id: '',
    work_date: '',
    clock_in: '',
    clock_out: '',
    work_schedule_id: '',
    status: 'present',
    leave_type: '',
    id: '' as any,
  });

  const [employeeLocked, setEmployeeLocked] = useState(true);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string>('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (data.id) {
      put(`/hr/attendance/${data.id}`, { onSuccess: () => reset('id') });
    } else {
      post('/hr/attendance', { onSuccess: () => reset('clock_in', 'clock_out', 'leave_type') });
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Attendance" />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Log Attendance</h3>
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
                  <button
                    type="button"
                    className="text-xs text-neutral-600 underline"
                    onClick={() => setEmployeeLocked((v) => !v)}
                  >
                    {employeeLocked ? 'Change' : 'Lock'}
                  </button>
                </div>
                {errors.employee_id && <p className="text-xs text-red-500">{errors.employee_id}</p>}
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={data.work_date} onChange={(e) => setData('work_date', e.target.value)} />
              </div>
              <div>
                <Label>Clock In</Label>
                <Input type="time" value={data.clock_in} onChange={(e) => setData('clock_in', e.target.value)} />
              </div>
              <div>
                <Label>Clock Out</Label>
                <Input type="time" value={data.clock_out} onChange={(e) => setData('clock_out', e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Input value={data.status} onChange={(e) => setData('status', e.target.value)} placeholder="present|absent|on_leave|holiday" />
              </div>
              <div>
                <Label>Leave Type</Label>
                <Input value={data.leave_type} onChange={(e) => setData('leave_type', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Recent Attendance</h3>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70 text-sm">
              {records.data.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-2">
                  <div className="flex-1">
                    <div>
                      {r.employee?.name ?? '—'}
                      {r.employee?.employee_code && (
                        <span className="ml-2 text-xs text-neutral-500">[{r.employee.employee_code}]</span>
                      )}
                    </div>
                    <div className="text-neutral-500">{r.work_date} · {r.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md bg-neutral-800 px-2 py-1 text-white"
                      onClick={() => {
                        setSelectedEmployeeCode(r.employee?.employee_code ?? '');
                        setEmployeeLocked(true);
                        setData((prev: any) => ({
                          ...prev,
                          id: r.id,
                          employee_id: r.employee?.id?.toString() ?? '',
                          work_date: r.work_date,
                          status: r.status,
                        }));
                      }}
                    >
                      Edit
                    </button>
                    <button className="rounded-md bg-red-600 px-2 py-1 text-white" onClick={() => router.delete(`/hr/attendance/${r.id}`)}>Delete</button>
                  </div>
                </div>
              ))}
              {records.data.length === 0 && <div className="p-3 text-sm text-neutral-500">No records.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
