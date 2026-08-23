import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import useSWR from 'swr';
import { PageBanner } from '@/components/common/PageBanner';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { POLICY_TYPES, type PolicyDoc } from '@/types/policy.types';

export function Policies() {
  const { data, isLoading } = useSWR('/cms/global/policies', fetcher);
  const documents: PolicyDoc[] = (Array.isArray(data?.content) ? data.content : [])
    .filter((doc: PolicyDoc) => doc.visibility !== 'internal');
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? documents : documents.filter((doc) => doc.type === filter)),
    [documents, filter]
  );

  const typesWithDocs = POLICY_TYPES.filter((type) => documents.some((doc) => doc.type === type));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner
        title="Documents & Policies"
        subtitle="Company profile, annual reports, and statutory policies of KNT World Welfare Foundation."
      />

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${filter === 'all' ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}
          >
            All
          </button>
          {typesWithDocs.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${filter === type ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="w-10 h-10 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin mx-auto" />
        ) : visible.length === 0 ? (
          <p className="text-center text-charcoal/50">No public documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {visible.map((doc) => (
              <a
                key={doc.id}
                href={getImageUrl(doc.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 bg-white border border-charcoal/10 rounded-2xl p-5 hover:border-deep-green/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-light-green text-deep-green flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal truncate">{doc.title}</p>
                    <p className="text-xs text-charcoal/50 mt-1">{doc.type}{doc.year ? ` · ${doc.year}` : ''}</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-charcoal/30 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
