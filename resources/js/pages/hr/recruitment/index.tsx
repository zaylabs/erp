import { Head, Form, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast-portal';

interface Recruitment { id: number; candidate_name: string; status: string; resume_path?: string; interviewer_suitable?: boolean; hr_approved_at?: string; expected_pay?: string }
interface Paged<T> { data: T[] }

export default function RecruitmentIndex({ recruitments, stage, counts }: { recruitments: Paged<Recruitment>, stage?: string, counts?: { interview: number, candidate: number, approved: number, rejected: number, trashed: number } }) {
  const page = usePage<any>();
  const status = page.props.status as string | undefined;
  const normalized = page.props.normalized_notice as string | undefined;
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR', href: '/hr' },
    { title: 'Recruitment and Onboarding', href: '/hr/recruitment' },
  ];

  const formRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [highlight, setHighlight] = useState(false);
  const { show } = useToast();
  const [focusIdx, setFocusIdx] = useState<number>(0);
  const [inlineSaved, setInlineSaved] = useState(false);

  // Drawer state for interview detail
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [drawerData, setDrawerData] = useState({ interviewer_suitable: 'yes', expected_pay: '', interviewer_comments: '' });

  const { data, setData, post, processing, reset, errors } = useForm({
    candidate_name: '', father_name: '', cnic: '', work_experience: '', address: '', phone: '', email: '',
    application_date: '', id: '' as any, cv: null as any,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = { ...data };
    if (data.id) {
      router.post(`/hr/recruitment/${data.id}?_method=PUT`, payload, {
        forceFormData: true,
        onSuccess: () => {
          show('Saved', 'success');
          focusNext(focusIdx);
          setInlineSaved(true);
          setTimeout(() => setInlineSaved(false), 1800);
        },
      });
    } else {
      post('/hr/recruitment', {
        forceFormData: true,
        onSuccess: () => {
          show('Saved', 'success');
          setInlineSaved(true);
          setTimeout(() => setInlineSaved(false), 1800);
          reset('candidate_name','father_name','cnic','address','phone','email','cv');
          // focus next field group after create
          focusNext(focusIdx);
        },
      });
    }
  }

  // focus management
  const fieldRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
  const focusNext = (from: number) => {
    const next = Math.min(from + 1, fieldRefs.current.length - 1);
    const el = fieldRefs.current[next];
    el?.focus();
    setFocusIdx(next);
  };
  const onKeyNext = (idx: number) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      focusNext(idx);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit(new Event('submit') as any);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Force default tab to interview if no stage is provided
  useEffect(() => {
    const qs = page.url.split('?')[1] ?? '';
    const params = new URLSearchParams(qs);
    if (!params.has('stage')) {
      router.get(`?stage=interview`, {}, { preserveState: true, preserveScroll: true, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast when record is created
  useEffect(() => {
    if (status === 'Recruitment saved') {
      show('Saved to Interview Candidates', 'success');
    }
  }, [status, show]);

  // Auto-open edit mode if ?edit=id present; scroll and briefly highlight form
  useEffect(() => {
    const qs = page.url.split('?')[1] ?? '';
    if (!qs) return;
    const params = new URLSearchParams(qs);
    const edit = params.get('edit');
    if (!edit) return;
    const arr: any[] = (recruitments.data as any[]);
    const rec: any = arr.find((r) => String(r.id) === String(edit));
    if (!rec) return;
    setData({
      ...data,
      id: rec.id,
      candidate_name: rec.candidate_name || '',
      father_name: (rec as any).father_name || '',
      cnic: (rec as any).cnic || '',
      work_experience: (rec as any).work_experience || '',
      address: (rec as any).address || '',
      phone: (rec as any).phone || '',
      email: (rec as any).email || '',
      application_date: (rec as any).application_date || '',
      status: rec.status || 'applied',
      interviewer_suitable: rec.interviewer_suitable ? 'yes' : 'no',
      interviewer_comments: (rec as any).interviewer_comments || '',
      expected_pay: rec.expected_pay || '',
      cv: null as any,
    } as any);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlight(true);
      nameInputRef.current?.focus();
      setTimeout(() => setHighlight(false), 1800);
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.url]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Recruitment" />
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <div className="md:col-span-2 flex gap-2">
          {[
            { key: 'interview', label: 'Interview Candidates', count: counts?.interview ?? 0 },
            { key: 'candidate', label: 'Candidates', count: counts?.candidate ?? 0 },
            { key: 'approved', label: 'Approved', count: counts?.approved ?? 0 },
            { key: 'rejected', label: 'Rejected', count: counts?.rejected ?? 0 },
            { key: 'trashed', label: 'Trashed', count: counts?.trashed ?? 0 },
          ].map((t) => (
            <Link
              key={t.key}
              href={`?stage=${t.key}`}
              className={`rounded-md border px-3 py-1 text-sm ${stage === t.key ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-transparent'}`}
              preserveState
              preserveScroll
            >
              {t.label} <span className="ml-1 rounded bg-neutral-200 px-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{t.count}</span>
            </Link>
          ))}
          {(stage && !['interview','candidate','approved','rejected','trashed'].includes(stage)) && (
            <Link href="?" className="rounded-md border px-2 py-1 text-sm" preserveState preserveScroll>Clear</Link>
          )}
          {stage === 'trashed' && (
            <button
              className="ml-auto rounded-md bg-emerald-700 px-3 py-1 text-sm text-white"
              onClick={() => router.post('/hr/recruitment/restore-all', {}, { preserveScroll: true, preserveState: true })}
            >
              Restore All
            </button>
          )}
        </div>
        {(normalized || status) && (
          <div className="md:col-span-2">
            {normalized && (
              <Alert>
                <AlertDescription>{normalized}</AlertDescription>
              </Alert>
            )}
            {status && (
              <Alert>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <Card>
          <CardContent className={`p-4 transition ${highlight ? 'ring-2 ring-amber-400 animate-pulse' : ''}`} ref={formRef}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold">Onboarding Form</h3>
              {data.id && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Edit mode – interview</span>
              )}
            </div>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3" encType="multipart/form-data">
              <div>
                <Label htmlFor="candidate_name">Candidate Name</Label>
                <Input id="candidate_name" name="candidate_name" ref={(el) => { nameInputRef.current = el; fieldRefs.current[0] = el; }} onFocus={() => setFocusIdx(0)} onKeyDown={onKeyNext(0)} value={data.candidate_name} onChange={(e) => setData('candidate_name', e.target.value)} required />
                <InputError message={errors.candidate_name} />
              </div>
              <div>
                <Label htmlFor="father_name">Father Name</Label>
                <Input id="father_name" name="father_name" ref={(el) => (fieldRefs.current[1] = el)} onFocus={() => setFocusIdx(1)} onKeyDown={onKeyNext(1)} value={data.father_name} onChange={(e) => setData('father_name', e.target.value)} required />
                <InputError message={errors.father_name} />
              </div>
              <div>
                <Label htmlFor="cnic">CNIC</Label>
                <Input id="cnic" name="cnic" ref={(el) => (fieldRefs.current[2] = el)} onFocus={() => setFocusIdx(2)} onKeyDown={onKeyNext(2)} value={data.cnic} onChange={(e) => setData('cnic', e.target.value)} required />
                <InputError message={errors.cnic} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" ref={(el) => (fieldRefs.current[3] = el)} onFocus={() => setFocusIdx(3)} onKeyDown={onKeyNext(3)} value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
                <InputError message={errors.phone} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" ref={(el) => (fieldRefs.current[4] = el)} onFocus={() => setFocusIdx(4)} onKeyDown={onKeyNext(4)} value={data.address} onChange={(e) => setData('address', e.target.value)} required />
                <InputError message={errors.address} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" ref={(el) => (fieldRefs.current[5] = el)} onFocus={() => setFocusIdx(5)} onKeyDown={onKeyNext(5)} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                <InputError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="application_date">Application Date</Label>
                <Input id="application_date" name="application_date" ref={(el) => (fieldRefs.current[6] = el)} onFocus={() => setFocusIdx(6)} onKeyDown={onKeyNext(6)} type="date" value={data.application_date} onChange={(e) => setData('application_date', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Work Experience</Label>
                <Input id="work_experience" name="work_experience" ref={(el) => (fieldRefs.current[7] = el)} onFocus={() => setFocusIdx(7)} onKeyDown={onKeyNext(7)} value={data.work_experience} onChange={(e) => setData('work_experience', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Upload CV (PDF)</Label>
                <Input id="cv" name="cv" type="file" accept="application/pdf" onChange={(e) => setData('cv', e.currentTarget.files?.[0] as any)} />
                <InputError message={errors.cv} />
              </div>
              {/* Interview fields are filled later from the list/detail page */}
              <div className="col-span-2">
                <Button type="submit" disabled={processing}>Save</Button>
                {inlineSaved && (
                  <span className="ml-2 align-middle text-xs text-green-600">Saved</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-lg font-semibold">Candidates</h3>
            <div className="divide-y divide-sidebar-border/60 rounded-md border border-sidebar-border/70 text-sm">
              {recruitments.data.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-2">
                  <div className="flex-1">
                    <div className="font-medium">{r.candidate_name}</div>
                    <div className="text-xs text-neutral-500">
                      {r.status} {r.hr_approved_at ? '· HR Approved' : ''}
                      {(r as any).status_changed_at && (
                        <span className="ml-2">· Updated {(r as any).status_changed_at?.slice(0,10)} by {((r as any).status_changer?.name) || ((r as any).statusChanger?.name) || '—'}</span>
                      )}
                    </div>
                    
                  </div>
                  <div className="flex gap-2">
                    {stage !== 'trashed' ? (
                      <>
                        <button
                          className="rounded-md bg-blue-600 px-2 py-1 text-white"
                          onClick={() => {
                            setSelected(r);
                            setDrawerOpen(true);
                            setDrawerData({
                              interviewer_suitable: r.interviewer_suitable ? 'yes' : 'no',
                              expected_pay: (r as any).expected_pay || '',
                              interviewer_comments: (r as any).interviewer_comments || '',
                            });
                          }}
                        >
                          Open
                        </button>
                        <button className="rounded-md bg-neutral-800 px-2 py-1 text-white" onClick={() => router.post(`/hr/recruitment/${r.id}/approve`)}>HR Approve</button>
                        <button
                          className="rounded-md bg-green-700 px-2 py-1 text-white"
                          onClick={() => {
                            if (confirm('Convert this candidate to Employee?')) {
                              router.post(`/hr/recruitment/${r.id}/convert`, {}, { preserveScroll: true, preserveState: true });
                            }
                          }}
                        >
                          Convert
                        </button>
                        <button className="rounded-md bg-red-600 px-2 py-1 text-white" onClick={() => router.delete(`/hr/recruitment/${r.id}`)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <button className="rounded-md bg-emerald-700 px-2 py-1 text-white" onClick={() => router.post(`/hr/recruitment/${r.id}/restore`, {}, { preserveScroll: true, preserveState: true })}>Restore</button>
                        <button
                          className="rounded-md bg-rose-700 px-2 py-1 text-white"
                          onClick={() => {
                            if (confirm('Permanently delete this recruitment? This action cannot be undone.')) {
                              router.post(`/hr/recruitment/${r.id}/force-delete`, {}, { preserveScroll: true, preserveState: true });
                            }
                          }}
                        >
                          Delete Permanently
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {recruitments.data.length === 0 && <div className="p-3 text-sm text-neutral-500">No candidates.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Interview drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Interview – {selected?.candidate_name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label htmlFor="drawer_suitable">Suitable</Label>
              <select id="drawer_suitable" className="w-full rounded border p-2" value={drawerData.interviewer_suitable} onChange={(e)=>setDrawerData({ ...drawerData, interviewer_suitable: e.target.value })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <Label htmlFor="drawer_expected">Expected Pay</Label>
              <Input id="drawer_expected" value={drawerData.expected_pay} onChange={(e)=>setDrawerData({ ...drawerData, expected_pay: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="drawer_comments">Comments</Label>
              <Input id="drawer_comments" value={drawerData.interviewer_comments} onChange={(e)=>setDrawerData({ ...drawerData, interviewer_comments: e.target.value })} />
            </div>
            <div className="col-span-2 mt-2 flex gap-2">
              <Button
                onClick={() => {
                  if (!selected) return;
                  router.post(`/hr/recruitment/${selected.id}?_method=PUT`, {
                    interviewer_suitable: drawerData.interviewer_suitable === 'yes',
                    expected_pay: drawerData.expected_pay,
                    interviewer_comments: drawerData.interviewer_comments,
                  }, { preserveScroll: true, preserveState: true, onSuccess: () => { setDrawerOpen(false); show('Interview saved','success'); } });
                }}
              >
                Save Interview
              </Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Close</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </AppLayout>
  );
}
