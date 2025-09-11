import { Head, Form, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Kpi { id: number; period?: string; employee?: { id: number; name: string; employee_code?: string } }
interface Paged<T> { data: T[] }

export default function KpisIndex({ kpis }: { kpis: Paged<Kpi> }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR', href: '/hr' },
    { title: 'KPIs', href: '/hr/kpis' },
    { title: 'Performance Management', href: '/hr/kpis' },
  ];

  const { data, setData, post, put, processing, reset } = useForm({
    employee_id: '',
    period: '',
    performance_rating: '',
    review_notes: '',
    id: '' as any,
  });

  const [employeeLocked, setEmployeeLocked] = useState(true);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string>('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (data.id) {
      put(`/hr/kpis/${data.id}`, { onSuccess: () => reset('id') });
    } else {
      post('/hr/kpis', { onSuccess: () => reset('performance_rating', 'review_notes') });
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="KPIs" />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Add KPI / Review</h3>
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
              </div>
              <div>
                <Label>Period</Label>
                <Input placeholder="2025-Q3" value={data.period} onChange={(e) => setData('period', e.target.value)} />
              </div>
              <div>
                <Label>Rating</Label>
                <Input value={data.performance_rating} onChange={(e) => setData('performance_rating', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Review Notes</Label>
                <Input value={data.review_notes} onChange={(e) => setData('review_notes', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Recent Reviews</h3>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70 text-sm">
              {kpis.data.map((k) => (
                <div key={k.id} className="flex items-center justify-between gap-2 p-2">
                  <div className="flex-1">
                    <div>
                      {k.employee?.name ?? '—'}
                      {k.employee?.employee_code && (
                        <span className="ml-2 text-xs text-neutral-500">[{k.employee.employee_code}]</span>
                      )}
                    </div>
                    <div className="text-neutral-500">{k.period ?? ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-neutral-800 px-2 py-1 text-white" onClick={() => { setSelectedEmployeeCode(k.employee?.employee_code ?? ''); setEmployeeLocked(true); setData((prev: any) => ({ ...prev, id: k.id, employee_id: k.employee?.id ? String(k.employee.id) : '', period: k.period ?? '' })) }}>Edit</button>
                    <button className="rounded-md bg-red-600 px-2 py-1 text-white" onClick={() => router.delete(`/hr/kpis/${k.id}`)}>Delete</button>
                  </div>
                </div>
              ))}
              {kpis.data.length === 0 && <div className="p-3 text-sm text-neutral-500">No KPIs.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
