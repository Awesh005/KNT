import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { useNavigate } from 'react-router';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ORG } from '@/config/org';
import { resolveCsrPage, resolveInternships } from '@/data/csrInternships';

export function Csr() {
  const navigate = useNavigate();
  const { data: pageData } = useSWR('/cms/global/csr_page', fetcher);
  const { data: listData } = useSWR('/cms/global/csr_internships', fetcher);
  const page = resolveCsrPage(pageData?.content);
  const internships = resolveInternships(listData?.content).filter((item) => item.isActive);

  return (
    <div className="min-h-screen bg-light-green pb-24 relative">
      <PageBanner
        title="CSR Internships"
        subtitle="College internships under our CSR-registered community programmes."
      />

      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-goldenrod mb-3">
            CSR Reg. No. {ORG.csr}
          </p>
          <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-deep-green mb-4">
            {page.heading}
          </Typography>
          <p className="text-charcoal/80 text-lg leading-relaxed">{page.intro}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {(page.highlights || []).map((item) => (
            <div key={item.title} className="bg-white rounded-3xl border border-charcoal/10 p-6 shadow-sm">
              <h3 className="font-bold text-deep-green mb-2">{item.title}</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-deep-green mb-4">
            Open Internships
          </Typography>
          <p className="text-charcoal/80 text-lg max-w-2xl mx-auto">
            Choose a role that matches your course and available weeks. These are student internships, not staff vacancies.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-charcoal/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-soft-green">
                <tr>
                  <th className="py-4 px-6 font-bold text-deep-green">S.No.</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Internship</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Duration</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Seats</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Eligibility</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Location / Support</th>
                  <th className="py-4 px-6 font-bold text-deep-green">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {internships.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-charcoal/50">
                      No internships are open right now. Please check back soon.
                    </td>
                  </tr>
                ) : (
                  internships.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-charcoal/60">{index + 1}</td>
                      <td className="py-4 px-6 font-bold text-deep-green">{item.title}</td>
                      <td className="py-4 px-6 text-charcoal whitespace-nowrap">{item.duration}</td>
                      <td className="py-4 px-6 font-bold text-charcoal">{item.seats}</td>
                      <td className="py-4 px-6 text-sm text-charcoal/80 max-w-xs">{item.eligibility}</td>
                      <td className="py-4 px-6 text-sm text-charcoal/80">
                        <div>{item.location}</div>
                        <div className="font-bold text-goldenrod mt-1">{item.stipend}</div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/csr/apply/${item.id}`)}
                          className="py-2 px-4 bg-deep-green hover:bg-[#1a4a38] text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          Apply Now
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
