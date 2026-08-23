import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Edit2, Search } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

export function ProgramsCMS() {
  const navigate = useNavigate();
  const { data } = useSWR('/cms/global/programs', fetcher);
  const programs: any[] = data?.content || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrograms = programs.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Programs CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage programs, impact copy, and SDG tags.
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 w-1/3">Description</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={getImageUrl(program.image)} alt={program.title} className="w-16 h-12 rounded-lg object-cover bg-gray-100 border border-charcoal/10" />
                  </td>
                  <td className="px-6 py-4 font-bold text-charcoal">{program.title}</td>
                  <td className="px-6 py-4 text-charcoal/60 line-clamp-2" title={program.description}>
                    {program.description}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => navigate(`/admin/cms/programs/${program.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit full program including SDG tags">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
