import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Recruitment {
  id: number;
  candidate_name: string;
  father_name?: string;
  cnic?: string;
  address?: string;
  phone?: string;
  email?: string;
  resume_path?: string;
  interviewer_suitable?: boolean;
  interviewer_comments?: string;
  expected_pay?: string;
  status: string;
}

export default function RecruitmentShow({ recruitment, transitions = [] as any[] }: { recruitment: Recruitment, transitions?: any[] }) {
  const form = useForm({
    interviewer_suitable: recruitment.interviewer_suitable ? 'yes' : 'no',
    interviewer_comments: recruitment.interviewer_comments || '',
    expected_pay: recruitment.expected_pay || '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.post(`/hr/recruitment/${recruitment.id}?_method=PUT`, {
      interviewer_suitable: form.data.interviewer_suitable === 'yes',
      interviewer_comments: form.data.interviewer_comments,
      expected_pay: form.data.expected_pay,
    });
  }

  // Filters / Sorting for audit transitions
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredTransitions = useMemo(() => {
    const toDate = (v: any) => (v ? new Date(v) : null);
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;
    const needle = search.trim().toLowerCase();
    const arr = Array.isArray(transitions) ? [...transitions] : [];
    const out = arr
      .filter((t) => {
        if (statusFilter !== 'all') {
          if (t.to_status !== statusFilter && t.from_status !== statusFilter) return false;
        }
        if (needle) {
          const hay = `${t.from_status || ''} ${t.to_status || ''} ${(t.changed_by_user?.name) || (t.changedByUser?.name) || ''} ${t.notes || ''}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        const d = toDate(t.changed_at);
        if (sDate && d && d < sDate) return false;
        if (eDate && d && d > eDate) return false;
        return true;
      })
      .sort((a, b) => {
        const da = toDate(a.changed_at)?.getTime() || 0;
        const db = toDate(b.changed_at)?.getTime() || 0;
        return sortDir === 'asc' ? da - db : db - da;
      });
    return out;
  }, [transitions, statusFilter, search, startDate, endDate, sortDir]);

  function exportCSV() {
    const rows = [
      ['Changed At', 'From', 'To', 'Changed By', 'Notes'],
      ...filteredTransitions.map((t) => [
        (t.changed_at ?? '').toString(),
        t.from_status ?? '',
        t.to_status ?? '',
        (t.changed_by_user?.name) || (t.changedByUser?.name) || '',
        (t.notes ?? '').toString().replace(/\n/g, ' '),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-${recruitment.id}-audit.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Recruitment', href: '/hr/recruitment' }, { title: recruitment.candidate_name, href: `/hr/recruitment/${recruitment.id}` }]}>
      <Head title={`Interview – ${recruitment.candidate_name}`} />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Candidate</h3>
            <div className="space-y-1 text-sm">
              <div><span className="text-neutral-500">Name:</span> {recruitment.candidate_name}</div>
              <div><span className="text-neutral-500">Father:</span> {recruitment.father_name || '—'}</div>
              <div><span className="text-neutral-500">CNIC:</span> {recruitment.cnic || '—'}</div>
              <div><span className="text-neutral-500">Phone:</span> {recruitment.phone || '—'}</div>
              <div><span className="text-neutral-500">Email:</span> {recruitment.email || '—'}</div>
              <div className="text-xs text-neutral-500">
                <span>Status:</span> {recruitment.status}
                { (recruitment as any).status_changed_at && (
                  <span> · Updated {(recruitment as any).status_changed_at?.toString().slice(0,10)} by {((recruitment as any).status_changer?.name) || ((recruitment as any).statusChanger?.name) || '—'}</span>
                )}
              </div>
              {recruitment.resume_path && (
                <div><Link href={`/storage/${recruitment.resume_path}`} className="text-blue-600 underline" target="_blank">View CV</Link></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Interview</h3>
            <Form onSubmit={submit} className="grid grid-cols-2 gap-3">
              <div>
                <Label>Suitable</Label>
                <select className="w-full rounded border p-2" value={form.data.interviewer_suitable} onChange={(e)=>form.setData('interviewer_suitable', e.target.value)}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <Label>Expected Pay</Label>
                <Input value={form.data.expected_pay} onChange={(e)=>form.setData('expected_pay', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Interviewer Comments</Label>
                <Input value={form.data.interviewer_comments} onChange={(e)=>form.setData('interviewer_comments', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Button type="submit">Save Interview</Button>
              </div>
            </Form>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => router.post(`/hr/recruitment/${recruitment.id}/approve`)} variant="secondary">HR Approve</Button>
              <Button onClick={() => router.post(`/hr/recruitment/${recruitment.id}/convert`)} variant="default">Convert</Button>
              <Button onClick={() => router.delete(`/hr/recruitment/${recruitment.id}`)} variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <h3 className="text-lg font-semibold">Audit History</h3>
              <div className="ml-auto flex flex-wrap items-end gap-2">
                <div className="flex flex-col">
                  <label className="text-xs text-neutral-500">Status</label>
                  <select className="rounded border px-2 py-1 text-sm" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="interview">Interview</option>
                    <option value="candidate">Candidate</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-neutral-500">From</label>
                  <input className="rounded border px-2 py-1 text-sm" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-neutral-500">To</label>
                  <input className="rounded border px-2 py-1 text-sm" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-neutral-500">Search</label>
                  <input className="rounded border px-2 py-1 text-sm" placeholder="name/notes" value={search} onChange={(e)=>setSearch(e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-neutral-500">Sort</label>
                  <select className="rounded border px-2 py-1 text-sm" value={sortDir} onChange={(e)=>setSortDir(e.target.value as any)}>
                    <option value="asc">Oldest</option>
                    <option value="desc">Newest</option>
                  </select>
                </div>
                <button className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-black" onClick={exportCSV}>Export CSV</button>
              </div>
            </div>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70 text-sm">
              {filteredTransitions.length ? filteredTransitions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2">
                  <div>
                    <div className="font-medium">{t.from_status ?? '—'} → {t.to_status}</div>
                    <div className="text-xs text-neutral-500">{(t.changed_at ?? '').toString().slice(0,16).replace('T',' ')} · {(t.changed_by_user?.name) || (t.changedByUser?.name) || '—'}</div>
                  </div>
                  {t.notes && <div className="text-xs text-neutral-600">{t.notes}</div>}
                </div>
              )) : <div className="p-3 text-neutral-500">No transitions yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
