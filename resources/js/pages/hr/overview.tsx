import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Employee {
  id: number;
  employee_code: string;
  name: string;
}

interface Paged<T> {
  data: T[];
}

interface OverviewProps {
  employees: Paged<Employee>;
  attendance: any[];
  payrolls: any[];
  kpis: any[];
  recruitments: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'HR', href: '/hr' },
];

export default function HrOverview({ employees, attendance, payrolls, kpis, recruitments }: OverviewProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="HR Overview" />
      <div className="flex flex-col gap-6 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <p className="text-sm text-neutral-500">Users and employee profiles</p>
                </div>
                <Link href="/hr/employees">
                  <Button variant="default">Manage</Button>
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {employees.data.slice(0, 5).map((e) => (
                  <Link key={e.id} href={`/hr/employees/${e.id}`} className="block rounded-md border border-sidebar-border/70 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-xs text-neutral-500">{e.employee_code}</span>
                    </div>
                  </Link>
                ))}
                {employees.data.length === 0 && <div className="text-sm text-neutral-500">No employees yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Time and Attendance</h3>
                  <p className="text-sm text-neutral-500">Schedules, clock-ins, leaves</p>
                </div>
                <Link href="/hr/attendance"><Button>Open</Button></Link>
              </div>
              <div className="mt-4 space-y-2">
                {attendance.slice(0, 5).map((a, idx) => (
                  <div key={idx} className="flex justify-between rounded-md border border-sidebar-border/70 p-2 text-sm">
                    <span>{a.employee?.name ?? '—'}</span>
                    <span className="text-neutral-500">{a.work_date}</span>
                  </div>
                ))}
                {attendance.length === 0 && <div className="text-sm text-neutral-500">No records yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Payroll and Compensation</h3>
                  <p className="text-sm text-neutral-500">Periods and totals</p>
                </div>
                <Link href="/hr/payroll"><Button>Open</Button></Link>
              </div>
              <div className="mt-4 space-y-2">
                {payrolls.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="flex justify-between rounded-md border border-sidebar-border/70 p-2 text-sm">
                    <span>{p.employee?.name ?? '—'}</span>
                    <span className="text-neutral-500">{p.period_start} → {p.period_end}</span>
                  </div>
                ))}
                {payrolls.length === 0 && <div className="text-sm text-neutral-500">No payrolls yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">KPIs & Performance</h3>
                  <p className="text-sm text-neutral-500">Reviews and goals</p>
                </div>
                <Link href="/hr/kpis"><Button>Open</Button></Link>
              </div>
              <div className="mt-4 space-y-2">
                {kpis.slice(0, 5).map((k, idx) => (
                  <div key={idx} className="flex justify-between rounded-md border border-sidebar-border/70 p-2 text-sm">
                    <span>{k.employee?.name ?? '—'}</span>
                    <span className="text-neutral-500">{k.period ?? ''}</span>
                  </div>
                ))}
                {kpis.length === 0 && <div className="text-sm text-neutral-500">No KPI entries yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Recruitment & Onboarding</h3>
                  <p className="text-sm text-neutral-500">Candidates and status</p>
                </div>
                <Link href="/hr/recruitment"><Button>Open</Button></Link>
              </div>
              <div className="mt-4 space-y-2">
                {recruitments.slice(0, 5).map((r, idx) => (
                  <div key={idx} className="flex justify-between rounded-md border border-sidebar-border/70 p-2 text-sm">
                    <span>{r.candidate_name}</span>
                    <span className="text-neutral-500">{r.status}</span>
                  </div>
                ))}
                {recruitments.length === 0 && <div className="text-sm text-neutral-500">No candidates yet.</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

