import { Head, useForm, router, Form } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface EmploymentDetail {
  id: number;
  job_title?: string;
  department?: string;
  pay_grade?: string;
  pay?: string;
  allowances?: string;
  transport?: string;
  other_allowances?: string;
  employment_status?: string;
  effective_date?: string;
  joining_date?: string;
  zone?: string;
  pjp?: Record<string, any>;
}

interface Employee {
  id: number;
  user_id?: number;
  employee_code: string;
  name: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  emergency_phone?: string;
  cnic?: string;
  role?: string;
  qr_payload?: string;
  employment_details: EmploymentDetail[];
  onboarding_status?: 'draft'|'submitted'|'approved'|'rejected';
  onboarding_submitted_at?: string;
  documents_received_at?: string;
  lock_at?: string;
  grace_until?: string;
  is_locked?: boolean;
  documents?: { id: number; type?: string; file_path: string }[];
}

export default function EmployeeShow({ employee }: { employee: Employee }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR', href: '/hr' },
    { title: 'Employees', href: '/hr/employees' },
    { title: employee.name, href: `/hr/employees/${employee.id}` },
    { title: 'Employment and Job Information', href: `/hr/employees/${employee.id}` },
  ];

  const qrText = encodeURIComponent(employee.qr_payload || `${employee.name} | ${employee.employee_code}`);
  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${qrText}`;

  const profile = useForm({
    user_id: employee.user_id ?? undefined,
    employee_code: employee.employee_code || '',
    name: employee.name || '',
    date_of_birth: employee.date_of_birth || '',
    phone: employee.phone || '',
    address: employee.address || '',
    emergency_phone: employee.emergency_phone || '',
    cnic: employee.cnic || '',
    role: employee.role || '',
  });

  const employmentForm = useForm({
    job_title: '',
    department: '',
    reporting_manager_id: '',
    employment_status: 'full-time',
    position: '',
    pay_grade: '',
    pay: '',
    allowances: '',
    transport: '',
    other_allowances: '',
    effective_date: '',
    joining_date: '',
    zone: '',
    pjp: '' as any,
  });

  const docForm = useForm<{ document: File | null; type: string }>({ document: null, type: 'CNIC' });
  const loginForm = useForm({ email: '', role: employee.role || 'Employee' });

  function updateEmployee(e: React.FormEvent) {
    e.preventDefault();
    profile.put(`/hr/employees/${employee.id}`);
  }

  function deleteEmployee() {
    router.delete(`/hr/employees/${employee.id}`);
  }

  function submitEmployment(e: React.FormEvent) {
    e.preventDefault();
    if (typeof employmentForm.data.pjp === 'string' && employmentForm.data.pjp) {
      try { employmentForm.setData('pjp', JSON.parse(employmentForm.data.pjp as any)); } catch {}
    }
    employmentForm.post(`/hr/employees/${employee.id}/employment`, { preserveScroll: true });
  }

  function submitDocument(e: React.FormEvent) {
    e.preventDefault();
    docForm.post(`/hr/employees/${employee.id}/documents`, { forceFormData: true, preserveScroll: true, onSuccess: () => docForm.reset() });
  }

  function createLogin(e: React.FormEvent) {
    e.preventDefault();
    loginForm.post(`/hr/employees/${employee.id}/create-login`, { preserveScroll: true });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={employee.name} />
      <div className="grid gap-6 p-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <h3 className="mb-1 text-lg font-semibold">Personal Information</h3>
            <p className="mb-4 text-sm text-neutral-500">Employee profile</p>
            <form onSubmit={updateEmployee} className="space-y-2 text-sm">
              <label className="block">
                <span className="text-neutral-500">Employee ID</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.employee_code} onChange={(e)=>profile.setData('employee_code', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Name</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.name} onChange={(e)=>profile.setData('name', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Date of Birth</span>
                <input type="date" className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.date_of_birth} onChange={(e)=>profile.setData('date_of_birth', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Phone</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.phone} onChange={(e)=>profile.setData('phone', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Emergency Phone</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.emergency_phone} onChange={(e)=>profile.setData('emergency_phone', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">CNIC</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.cnic} onChange={(e)=>profile.setData('cnic', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Address</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.address} onChange={(e)=>profile.setData('address', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-neutral-500">Role</span>
                <input className="mt-1 w-full rounded-md border bg-transparent p-2" value={profile.data.role} onChange={(e)=>profile.setData('role', e.target.value)} />
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" disabled={profile.processing}>Save</button>
                <button type="button" className="rounded-md bg-red-600 px-3 py-2 text-white" onClick={deleteEmployee}>Delete</button>
              </div>
            </form>
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold">QR Code (ID)</h4>
              <div className="flex items-center justify-center rounded-md border border-sidebar-border/70 p-3">
                <img src={qrSrc} alt="Employee QR" className="h-48 w-48" />
              </div>
              <p className="mt-2 text-xs text-neutral-500">Contains name and employee ID</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h3 className="mb-1 text-lg font-semibold">Employment & Compensation</h3>
            <p className="mb-4 text-sm text-neutral-500">Latest records first</p>
            <form onSubmit={submitEmployment} className="mb-4 grid grid-cols-3 gap-3 text-sm">
              <input className="rounded-md border p-2" placeholder="Designation" value={employmentForm.data.job_title} onChange={(e)=>employmentForm.setData('job_title', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Department" value={employmentForm.data.department} onChange={(e)=>employmentForm.setData('department', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Reporting Manager ID" value={employmentForm.data.reporting_manager_id} onChange={(e)=>employmentForm.setData('reporting_manager_id', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Employment Status" value={employmentForm.data.employment_status} onChange={(e)=>employmentForm.setData('employment_status', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Position" value={employmentForm.data.position} onChange={(e)=>employmentForm.setData('position', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Pay Grade" value={employmentForm.data.pay_grade} onChange={(e)=>employmentForm.setData('pay_grade', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Pay" value={employmentForm.data.pay} onChange={(e)=>employmentForm.setData('pay', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Allowances" value={employmentForm.data.allowances} onChange={(e)=>employmentForm.setData('allowances', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Transport" value={employmentForm.data.transport} onChange={(e)=>employmentForm.setData('transport', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Other Allowances" value={employmentForm.data.other_allowances} onChange={(e)=>employmentForm.setData('other_allowances', e.target.value)} />
              <input type="date" className="rounded-md border p-2" placeholder="Effective Date" value={employmentForm.data.effective_date} onChange={(e)=>employmentForm.setData('effective_date', e.target.value)} />
              <input type="date" className="rounded-md border p-2" placeholder="Joining Date" value={employmentForm.data.joining_date} onChange={(e)=>employmentForm.setData('joining_date', e.target.value)} />
              <input className="rounded-md border p-2" placeholder="Zone (optional)" value={employmentForm.data.zone} onChange={(e)=>employmentForm.setData('zone', e.target.value)} />
              {/* PJP deferred to later phase */}
              <div className="col-span-3"><button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" disabled={employmentForm.processing}>Save Configuration</button></div>
            </form>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70">
              {employee.employment_details?.length ? employee.employment_details.map((d) => (
                <div key={d.id} className="grid grid-cols-2 gap-2 p-3 text-sm">
                  <div><span className="text-neutral-500">Job Title:</span> {d.job_title || '—'}</div>
                  <div><span className="text-neutral-500">Department:</span> {d.department || '—'}</div>
                  <div><span className="text-neutral-500">Status:</span> {d.employment_status || '—'}</div>
                  <div><span className="text-neutral-500">Pay Grade:</span> {d.pay_grade || '—'}</div>
                  <div><span className="text-neutral-500">Position:</span> {d.position || '—'}</div>
                  <div><span className="text-neutral-500">Pay:</span> {d.pay || '—'}</div>
                  <div><span className="text-neutral-500">Allowances:</span> {d.allowances || '—'}</div>
                  <div><span className="text-neutral-500">Transport:</span> {d.transport || '—'}</div>
                  <div><span className="text-neutral-500">Other:</span> {d.other_allowances || '—'}</div>
                  <div><span className="text-neutral-500">Effective:</span> {d.effective_date || '—'}</div>
                  <div><span className="text-neutral-500">Joining:</span> {d.joining_date || '—'}</div>
                  <div className="col-span-2 flex justify-end">
                    <button className="rounded-md bg-red-600 px-2 py-1 text-xs text-white" onClick={() => router.delete(`/hr/employees/${employee.id}/employment/${d.id}`)}>Delete</button>
                  </div>
                </div>
              )) : <div className="p-3 text-sm text-neutral-500">No employment records.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <h3 className="mb-1 text-lg font-semibold">Onboarding & Documents</h3>
            <p className="mb-4 text-sm text-neutral-500">Workflow actions and uploads</p>
            <div className="mb-4 grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-neutral-500">Status:</span> {employee.onboarding_status ?? 'draft'}</div>
              <div><span className="text-neutral-500">Submitted:</span> {(employee.onboarding_submitted_at || '').toString().slice(0,10) || '—'}</div>
              <div><span className="text-neutral-500">Docs Received:</span> {(employee.documents_received_at || '').toString().slice(0,10) || '—'}</div>
              <div><span className="text-neutral-500">Locked:</span> {employee.is_locked ? 'Yes' : 'No'}</div>
              <div><span className="text-neutral-500">Lock At:</span> {employee.lock_at || '—'}</div>
              <div><span className="text-neutral-500">Grace Until:</span> {employee.grace_until || '—'}</div>
            </div>
              <div className="mb-4 rounded-md border border-sidebar-border/70 p-3 text-sm">
                <div className="mb-2 font-medium">Required PDFs</div>
              {['CV','CNIC','Certificate'].map((t) => {
                const has = (employee.documents || []).some((d) => d.type === t);
                return (
                  <div key={t} className="flex items-center justify-between">
                    <span>{t}</span>
                    <span className={has ? 'text-green-600' : 'text-red-600'}>{has ? 'Uploaded' : 'Missing'}</span>
                  </div>
                );
              })}
              </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md bg-neutral-800 px-3 py-2 text-white" onClick={() => router.post(`/hr/employees/${employee.id}/submit`)}>Submit for Review</button>
              <button className="rounded-md bg-green-700 px-3 py-2 text-white" onClick={() => router.post(`/hr/employees/${employee.id}/documents/received`)}>Mark Docs Received</button>
              <button className="rounded-md bg-yellow-600 px-3 py-2 text-white" onClick={() => router.post(`/hr/employees/${employee.id}/approve-grace`)}>Approve 30-day Grace</button>
              <button className="rounded-md bg-rose-700 px-3 py-2 text-white" onClick={() => router.post(`/hr/onboarding/run-lock-check`)}>Run Lock Check</button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Upload Documents</h4>
                <Form onSubmit={submitDocument} encType="multipart/form-data" className="space-y-2 text-sm">
                  <select className="w-full rounded-md border p-2" value={docForm.data.type} onChange={(e)=>docForm.setData('type', e.target.value)}>
                    <option>CV</option>
                    <option>CNIC</option>
                    <option>Certificate</option>
                  </select>
                  <input className="w-full rounded-md border p-2" type="file" accept="application/pdf" onChange={(e)=>docForm.setData('document', e.currentTarget.files?.[0] ?? null)} />
                  <button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" disabled={docForm.processing}>Upload</button>
                </Form>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Uploaded</h4>
                <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70">
                  {employee.documents?.length ? employee.documents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-2 text-sm">
                      <div>
                        <div className="font-medium">{d.type || 'Document'}</div>
                        <a className="text-xs text-blue-600 underline" href={`/storage/${d.file_path}`} target="_blank" rel="noreferrer">View</a>
                      </div>
                      <button className="rounded-md bg-red-600 px-2 py-1 text-xs text-white" onClick={() => router.delete(`/hr/employees/${employee.id}/documents/${d.id}`)}>Delete</button>
                    </div>
                  )) : <div className="p-3 text-sm text-neutral-500">No documents uploaded.</div>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold">Create Login</h4>
              <form onSubmit={createLogin} className="grid grid-cols-3 gap-3 text-sm">
                <input className="rounded-md border p-2" type="email" placeholder="Work Email" value={loginForm.data.email} onChange={(e)=>loginForm.setData('email', e.target.value)} />
                <input className="rounded-md border p-2" placeholder="Role" value={loginForm.data.role} onChange={(e)=>loginForm.setData('role', e.target.value)} />
                <button className="rounded-md bg-neutral-800 px-3 py-2 text-white" disabled={loginForm.processing}>Create</button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
