import { useParams } from 'react-router';
import useSWR from 'swr';
import { PageBanner } from '@/components/common/PageBanner';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

const KIND_LABEL: Record<string, string> = {
  membership: 'Member ID',
  volunteer: 'Volunteer ID',
  letter: 'Official letter',
  '80g': '80G certificate',
};

export function Verify() {
  const params = useParams();
  const code = params.code || params.id || '';
  const { data, isLoading } = useSWR(code ? `/office/verify/${encodeURIComponent(code)}` : null, fetcher);
  const valid = Boolean(data?.valid);
  const kind = KIND_LABEL[data?.kind] || data?.kind;

  return (
    <>
      <PageBanner title="ID verification" subtitle="Scan a QR on a member ID, volunteer ID, 80G certificate, or official letter." />
      <section className="py-16">
        <div className="max-w-lg mx-auto px-4 bg-white rounded-3xl border border-charcoal/5 p-8 text-center">
          {isLoading && <p>Checking...</p>}
          {!isLoading && !data && <p className="text-charcoal/50">Could not check this code.</p>}
          {data && (
            <>
              {data.photoUrl && (
                <img src={getImageUrl(data.photoUrl)} alt="" className="w-28 h-36 object-cover rounded-xl mx-auto mb-4 bg-fog-gray" />
              )}
              <p className={`text-sm font-bold uppercase tracking-wider ${valid ? 'text-deep-green' : 'text-red-600'}`}>
                {valid ? 'Valid' : 'Invalid'}
              </p>
              <h2 className="text-2xl font-bold mt-2">{data.holder || 'Unknown'}</h2>
              <p className="text-charcoal/60 mt-1">{kind || data.title || 'No record'}</p>
              {data.title && kind && <p className="text-sm text-charcoal/50 mt-1">{data.title}</p>}
              {data.number && <p className="font-mono text-sm mt-3">{data.number}</p>}
              {data.status && <p className="text-sm text-charcoal/50 mt-1 capitalize">{data.status}</p>}
              {data.expiresAt && <p className="text-sm mt-2">Valid till {String(data.expiresAt).slice(0, 10)}</p>}
              {data.pdfUrl && valid && (
                <a href={getImageUrl(data.pdfUrl)} target="_blank" rel="noreferrer" className="inline-block mt-6 text-sm font-bold text-deep-green">
                  Open document
                </a>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
