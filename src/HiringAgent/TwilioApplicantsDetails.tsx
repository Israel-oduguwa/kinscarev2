"use client";

import MongoContext from "@/app/MongoContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

function formatTel(raw?: string | null) {
  if (!raw) return "—";
  const s = raw.startsWith("+") ? raw : `+${raw}`;
  return s;
}

function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

// Safely get string id from ObjectId-like shapes
function toIdString(id: any): string | null {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    // Mongo may serialize as { $oid: "..." } or { oid: "..." }
    if (id.$oid) return String(id.$oid);
    if (id.oid) return String(id.oid);
    // Fallback stringify (last resort)
    try {
      return String(id);
    } catch {
      return null;
    }
  }
  return null;
}

export default function TwilioApplicantsDetails() {
  const params = useParams();
  const id = params?.id as string;

  const { userData }: any = useContext(MongoContext);
  const agentUserId = userData?.userID;

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [contacted, setContacted] = useState<boolean>(false);
  const [accountCreated, setAccountCreated] = useState<boolean>(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [savingContacted, setSavingContacted] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  const API_BASE = "http://localhost:8081/api/v1/providers";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetJob, setTargetJob] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const onRequestDeleteJob = (job: any) => {
    setTargetJob(job);
    setConfirmOpen(true);
  };

  const onConfirmDeleteJob = async () => {
    if (!targetJob) return;
    setDeleting(true);
    try {
      await axios.post(`${API_BASE}/jumpstart/delete-job`, {
        jobId: toIdString(targetJob.jobId), // stored as ObjectId in snippet
        applicantId: id, // Twilio lead id
        requesterId: agentUserId, // optional auth hint
        force: false, // set true only if you want to allow claimed deletions
      });
      setConfirmOpen(false);
      setTargetJob(null);
      await fetchApplicant(); // refresh list
    } catch (e: any) {
      // optional: surface error
      console.error("Delete job failed:", e?.response?.data || e?.message || e);
    } finally {
      setDeleting(false);
    }
  };
  const fetchApplicant = async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get(`${API_BASE}/jumpstart/applicant/${id}`);
      const data = res.data?.data || null;
      setApplicant(data);
      setContacted(!!data?.contacted);
      setAccountCreated(!!data?.accountCreated);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load applicant."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tel =
    applicant?.phone ??
    applicant?.contact?.channel?.address ??
    applicant?.contact?.channelAddress ??
    null;

  const onSaveContacted = async () => {
    if (!id) return;
    setSavingContacted(true);
    try {
      await axios.post(`${API_BASE}/jumpstart/edit-twilio-details`, {
        id,
        contacted,
      });
    } catch (e: any) {
      setContacted((v) => !v);
    } finally {
      setSavingContacted(false);
      fetchApplicant();
    }
  };

  const onSaveAccountCreated = async () => {
    if (!id) return;
    setSavingAccount(true);
    try {
      await axios.post(`${API_BASE}/jumpstart/edit-twilio-details`, {
        id,
        accountCreated,
      });
    } catch (e: any) {
      setAccountCreated((v) => !v);
    } finally {
      setSavingAccount(false);
      fetchApplicant();
    }
  };

  const onAddNote = async () => {
    if (!id || !note.trim()) return;
    setAddingNote(true);
    try {
      await axios.post(`${API_BASE}/jumpstart/edit-twilio-details`, {
        id,
        note: note.trim(),
        userID: agentUserId,
      });
      setNote("");
    } catch {
      // keep note text for retry
    } finally {
      setAddingNote(false);
      fetchApplicant();
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{err}</AlertDescription>
        </Alert>
        <Button onClick={fetchApplicant}>Retry</Button>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-2">
          No applicant found
        </h3>
        <p className="text-slate-600 mb-4">
          The requested applicant data could not be loaded.
        </p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const tags: string[] = Array.isArray(applicant.tags) ? applicant.tags : [];
  const agentJobs: any[] = Array.isArray(applicant.agent_jobs)
    ? applicant.agent_jobs
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
            {String(applicant?.email || "?")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {applicant?.email || "No email provided"}
              </h1>
              {applicant?.jump_start && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                  Jumpstart
                </Badge>
              )}
              {applicant?.source && (
                <Badge variant="secondary" className="border-0">
                  {applicant.source}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Created: {fmtDate(applicant.createdAt)} • ID: {applicant._id}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/agent/twilio/provider/${id}/post`}>
            <Button className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Post Job
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-slate-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Phone</p>
                <p className="font-semibold text-slate-900">{formatTel(tel)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <p className="font-semibold text-slate-900 truncate">
                  {applicant.email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Zipcode</p>
                <p className="font-semibold text-slate-900">
                  {applicant.zipcode || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Created</p>
                <p className="font-semibold text-slate-900">
                  {fmtDate(applicant.timestamp || applicant.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-slate-600" />
              Contact Status
            </CardTitle>
            <CardDescription>Track communication progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    contacted ? "bg-green-100" : "bg-slate-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      contacted ? "text-green-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Contacted Applicant
                  </div>
                  <div className="text-sm text-slate-600">
                    Mark when initial contact is made
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={contacted}
                  onChange={(e) => setContacted(e.target.checked)}
                />
                <Button
                  size="sm"
                  disabled={savingContacted}
                  onClick={onSaveContacted}
                  className="min-w-20"
                >
                  {savingContacted ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-slate-600" />
              Account Status
            </CardTitle>
            <CardDescription>Track onboarding progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    accountCreated ? "bg-green-100" : "bg-slate-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      accountCreated ? "text-green-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Account Created
                  </div>
                  <div className="text-sm text-slate-600">
                    Mark when account is set up
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={accountCreated}
                  onChange={(e) => setAccountCreated(e.target.checked)}
                />
                <Button
                  size="sm"
                  disabled={savingAccount}
                  onClick={onSaveAccountCreated}
                  className="min-w-20"
                >
                  {savingAccount ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-slate-600" />
            Notes & Communication
          </CardTitle>
          <CardDescription>
            Add notes and track conversations. Newest notes appear first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note Composer */}
          <div className="space-y-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about your conversation with this applicant (e.g., 'Called and left voicemail', 'Scheduled follow-up for tomorrow', etc.)"
              className="w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {agentUserId
                  ? `You will be recorded as author (${agentUserId}).`
                  : "Author ID missing; note will be rejected by API."}
              </div>
              <Button
                onClick={onAddNote}
                disabled={addingNote || !note.trim() || !agentUserId}
                className="flex items-center gap-2"
              >
                {addingNote ? (
                  <>Adding...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Add Note
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Previous Notes</h4>
            {Array.isArray(applicant.notes) && applicant.notes.length > 0 ? (
              <div className="space-y-3">
                {applicant.notes.map((n: any) => (
                  <div
                    key={n._id || n.createdAt}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-900">
                        Note
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(n.createdAt)}{" "}
                        {n.authorId ? `• ${n.authorId}` : ""}
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {n.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Send className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No notes yet. Add your first note above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Posted for this Applicant */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-slate-600" />
            Jobs Posted for this Applicant
          </CardTitle>
          <CardDescription>
            Agent-created jobs linked to this Twilio lead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentJobs.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">No jobs posted yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Use the <span className="font-medium">Post Job</span> button
                above to create a job for this applicant.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {agentJobs.map((job: any, idx: number) => {
                const jobId = toIdString(job.jobId);
                const created = fmtDate(job.created);
                const schedule: string[] = Array.isArray(job.schedule)
                  ? job.schedule
                  : [];
                const licenses: string[] = Array.isArray(job.licenses)
                  ? job.licenses
                  : [];
                const days: string[] = Array.isArray(job.days) ? job.days : [];
                const zipcode = job.zipcode || applicant.zipcode || "—";
                const state = job.state || "—";

                return (
                  <div
                    key={jobId || idx}
                    className="p-4 rounded-xl border bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {job.title || "Untitled Job"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Created: {created}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {jobId ? (
                          <Link href={`/agent/jobs/${jobId}`}>
                            <Button size="sm" variant="outline">
                              View Job
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            View Job
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRequestDeleteJob(job)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {schedule.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {licenses.map((l: string) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                      {days.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {days.join(", ")}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium">Location:</span>{" "}
                      {state !== "—" || zipcode !== "—"
                        ? `${state} ${zipcode}`
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
            <DialogDescription>
              This will remove the job from the Jobs collection and unlink it
              from this applicant. This action cannot be undone. Continue?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 mb-2">
            <div className="font-medium">Job</div>
            <div>
              Title:{" "}
              <span className="font-semibold">
                {targetJob?.title || "Untitled Job"}
              </span>
            </div>
            <div>Created: {fmtDate(targetJob?.created)}</div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDeleteJob}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
