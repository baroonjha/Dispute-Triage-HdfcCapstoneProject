import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Dispute Triage System
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          AI-Powered Dispute Resolution & Triage Platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go to Dashboard <ArrowRight className="ml-2 inline-block h-4 w-4" />
          </Link>
          <Link
            href="/portal"
            className="text-sm font-semibold leading-6 text-slate-900"
          >
            Customer Portal <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
