import { Link } from 'react-router';
import { ArrowUpRight, CheckCircle2, Clock, CreditCard, XCircle } from 'lucide-react';
import type { Donation, Campaign } from '@/types';

interface RecentDonationsProps {
  donations: Donation[];
  campaigns: Campaign[];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarTone(name: string) {
  const tones = [
    'bg-deep-green/10 text-deep-green',
    'bg-goldenrod/15 text-goldenrod',
    'bg-soft-green text-deep-green',
    'bg-mint-green text-deep-green',
  ];
  const n = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return tones[n % tones.length];
}

export function RecentDonations({ donations, campaigns }: RecentDonationsProps) {
  const recent = [...donations]
    .sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime())
    .slice(0, 5);

  const pendingCount = donations.filter((d) => d.status === 'pending').length;

  const statusMeta = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          label: 'Verified',
          className: 'bg-green-50 text-green-700',
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'Failed',
          className: 'bg-red-50 text-red-600',
        };
      default:
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-amber-50 text-amber-700',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-charcoal/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-light-green text-deep-green flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg text-charcoal leading-tight">Recent Donations</h2>
            <p className="text-xs text-charcoal/45 mt-0.5">
              Latest gifts{pendingCount > 0 ? ` · ${pendingCount} waiting review` : ''}
            </p>
          </div>
        </div>
        <Link
          to="/admin/donations"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-deep-green hover:text-deep-green/80 shrink-0"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-fog-gray text-charcoal/35 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-charcoal">No donations yet</p>
          <p className="text-xs text-charcoal/45 mt-1 max-w-[220px]">
            New gifts will show up here as soon as someone donates.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-charcoal/5 flex-1">
          {recent.map((donation) => {
            const campaign = campaigns.find((c) => String(c.id) === String(donation.campaignId));
            const name = donation.donorName || 'Anonymous';
            const campaignTitle = campaign?.title || donation.campaignTitle || 'General donation';
            const status = statusMeta(donation.status);
            const StatusIcon = status.icon;

            return (
              <li key={donation.id}>
                <Link
                  to="/admin/donations"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-fog-gray/70 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarTone(name)}`}
                  >
                    {initials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-charcoal truncate">{name}</p>
                      <p className="text-sm font-bold text-deep-green tabular-nums shrink-0">
                        ₹{Number(donation.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <p className="text-xs text-charcoal/45 truncate">
                        {campaignTitle}
                        <span className="text-charcoal/25"> · </span>
                        {new Date(donation.donatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
