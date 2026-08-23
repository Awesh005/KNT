import { Link } from 'react-router';
import { ArrowUpRight, CheckCircle2, ClipboardList, Inbox } from 'lucide-react';
import type { Campaign } from '@/types';

interface PendingRequestsProps {
  campaigns: Campaign[];
}

export function PendingRequests({ campaigns }: PendingRequestsProps) {
  const pending = campaigns
    .filter((c) => c.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-charcoal/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-goldenrod/15 text-goldenrod flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg text-charcoal leading-tight">Pending Requests</h2>
            <p className="text-xs text-charcoal/45 mt-0.5">
              {pending.length === 0
                ? 'Fundraiser applications'
                : `${pending.length} waiting for review`}
            </p>
          </div>
        </div>
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-deep-green hover:text-deep-green/80 shrink-0"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {pending.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-gradient-to-b from-white to-fog-gray/60">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3 ring-8 ring-green-50/70">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-charcoal">All caught up</p>
          <p className="text-xs text-charcoal/45 mt-1 max-w-[240px] leading-relaxed">
            No fundraiser requests waiting. New applications will appear here for approve or reject.
          </p>
          <Link
            to="/admin/requests"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-deep-green bg-light-green px-3 py-1.5 rounded-full hover:bg-mint-green transition-colors"
          >
            <Inbox className="w-3.5 h-3.5" />
            Open requests inbox
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-charcoal/5 flex-1">
          {pending.map((campaign) => (
            <li key={campaign.id}>
              <Link
                to="/admin/requests"
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-fog-gray/70 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-goldenrod/10 text-goldenrod flex items-center justify-center shrink-0 text-[11px] font-bold uppercase">
                  {(campaign.category || 'O').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-charcoal truncate">{campaign.title}</p>
                    <p className="text-sm font-bold text-charcoal tabular-nums shrink-0">
                      ₹{Number(campaign.targetAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <p className="text-xs text-charcoal/45 truncate">
                      {campaign.creatorName || 'Unknown'}
                      <span className="text-charcoal/25"> · </span>
                      {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-deep-green shrink-0">
                      Review
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
