import { useParams } from 'react-router';
import useSWR from 'swr';
import { PageBanner } from '@/components/common/PageBanner';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

export function MemberVerify() {
  const { id = '' } = useParams();
  const { data, error, isLoading } = useSWR(id ? `/people/verify/${id}` : null, fetcher);
  const record = data?.record;

  const valid = Boolean(record && (record.status === 'active' || record.volunteer_no));
  const name = record?.name;
  const number = record?.member_no || record?.volunteer_no;
  const kind = record?.member_no ? 'Member' : record?.volunteer_no ? 'Volunteer' : 'Unknown';

  return (
    <>
      <PageBanner title="ID verification" subtitle={`Checking ${id}`} />
      <section className="py-16">
        <div className="max-w-lg mx-auto px-4 bg-white rounded-3xl border border-charcoal/5 p-8 text-center">
          {isLoading && <p>Verifying...</p>}
          {error && <p className="text-red-600">Could not verify this ID.</p>}
          {!isLoading && !record && <p className="text-charcoal/60">This ID is not valid.</p>}
          {record && (
            <>
              {record.photo_url && <img src={getImageUrl(record.photo_url)} alt="" className="w-28 h-36 object-cover rounded-xl mx-auto mb-4" />}
              <p className={`text-sm font-bold uppercase tracking-wider ${valid ? 'text-deep-green' : 'text-red-600'}`}>
                {valid ? 'Valid' : record.status}
              </p>
              <h2 className="text-2xl font-bold mt-2">{name}</h2>
              <p className="text-charcoal/60">{kind} · {number}</p>
              {record.expires_at && <p className="text-sm mt-2">Valid till {String(record.expires_at).slice(0, 10)}</p>}
            </>
          )}
        </div>
      </section>
    </>
  );
}
