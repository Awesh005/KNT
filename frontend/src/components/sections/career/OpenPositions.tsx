
import { useNavigate } from 'react-router';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function OpenPositions() {
  const { data } = useSWR('/cms/global/careers', fetcher);
  const allJobs = data?.content || [];
  const jobs = allJobs.filter((j: any) => j.isActive);
  const navigate = useNavigate();

  const handleApplyClick = (job: any) => {
    navigate(`/apply/${job.id}`);
  };

  return (
    <>
      <div className="text-center mb-10">
        <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-deep-green mb-4">
          Post-Wise Vacancy & Salary Details
        </Typography>
        <p className="text-charcoal/80 text-lg max-w-2xl mx-auto">
          Review the available positions and apply for the one that matches your skills.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-charcoal/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-soft-green">
              <tr>
                <th className="py-4 px-6 font-bold text-deep-green">S.No.</th>
                <th className="py-4 px-6 font-bold text-deep-green">Post Name</th>
                <th className="py-4 px-6 font-bold text-deep-green">Vacancies</th>
                <th className="py-4 px-6 font-bold text-deep-green">Min. Qualification / Skill</th>
                <th className="py-4 px-6 font-bold text-deep-green whitespace-nowrap">Salary Range</th>
                <th className="py-4 px-6 font-bold text-deep-green">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {jobs.map((job: any, index: any) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-charcoal/60">{index + 1}</td>
                  <td className="py-4 px-6 font-bold text-deep-green">{job.title}</td>
                  <td className="py-4 px-6 font-bold text-charcoal">{job.vacancies}</td>
                  <td className="py-4 px-6 text-sm text-charcoal/80 max-w-xs">{job.qualifications}</td>
                  <td className="py-4 px-6 font-bold text-goldenrod whitespace-nowrap">{job.salaryRange}</td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="py-2 px-4 bg-deep-green hover:bg-[#1a4a38] text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
