import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { ChevronDown } from 'lucide-react';
import type { Donation } from '@/types';

interface CampaignDonorsProps {
  donations: Donation[];
}

export function CampaignDonors({ donations }: CampaignDonorsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="pt-8 border-t border-charcoal/10">
        <Typography variant="h3" className="mb-6 flex items-center gap-2">
          Recent Donations
        </Typography>
        
        {donations.length > 0 ? (
          <div className="space-y-4">
            {donations.slice(0, 8).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-deep-green/[0.08] rounded-xl border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-fog-gray flex items-center justify-center text-charcoal font-bold">
                    {(donation.donorName || 'Anonymous') === 'Anonymous' ? 'A' : (donation.donorName || 'Anonymous').charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-charcoal text-[15px]">{donation.donorName || 'Anonymous'}</div>
                    <div className="text-[12px] text-charcoal/50">{new Date(donation.donatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="font-bold text-deep-green">
                  ₹{donation.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-charcoal/50 text-[14px] bg-fog-gray p-6 rounded-xl text-center">
            Be the first to support this campaign!
          </div>
        )}
      </div>


      {/* Code of Practice */}
      <div className="pt-8 border-t border-charcoal/10">
        <Typography variant="h3" className="mb-6 flex items-center gap-2 text-deep-green">
          Our Code of Practice
        </Typography>
        <div className="border border-charcoal/10 rounded-2xl overflow-hidden bg-white">
          <ul className="divide-y divide-charcoal/10">
            <li className="p-5 hover:bg-gray-50 transition-colors">
              <Typography variant="body" className="font-bold text-deep-green mb-1 text-[15px]">
                No guilt-tripping or pressure
              </Typography>
              <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
                Every appeal respects your choice to give, without emotional coercion.
              </Typography>
            </li>
            <li className="p-5 hover:bg-gray-50 transition-colors">
              <Typography variant="body" className="font-bold text-deep-green mb-1 text-[15px]">
                Transparent use of funds
              </Typography>
              <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
                Donations are tracked and used only for verified needs, with clear updates where possible.
              </Typography>
            </li>
            <li className="p-5 hover:bg-gray-50 transition-colors">
              <Typography variant="body" className="font-bold text-deep-green mb-1 text-[15px]">
                No spam for donations
              </Typography>
              <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
                You'll never receive phone calls or WhatsApp messages pressuring you to donate more.
              </Typography>
            </li>
            <li className="p-5 hover:bg-gray-50 transition-colors">
              <Typography variant="body" className="font-bold text-deep-green mb-1 text-[15px]">
                Secure transactions
              </Typography>
              <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
                All payments are encrypted and processed through trusted secure payment gateways.
              </Typography>
            </li>
            <li className="p-5 hover:bg-gray-50 transition-colors">
              <Typography variant="body" className="font-bold text-deep-green mb-1 text-[15px]">
                Direct impact
              </Typography>
              <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
                We minimize overhead costs to ensure your contribution reaches those who need it most.
              </Typography>
            </li>
          </ul>
        </div>
      </div>

      {/* FAQs */}
      <div className="pt-8 mt-8 border-t border-charcoal/10">
        <Typography variant="h3" className="mb-6 text-deep-green text-center">
          Frequently Asked Questions
        </Typography>
        <div className="border border-charcoal/10 rounded-2xl overflow-hidden bg-white">
          <ul className="divide-y divide-charcoal/10">
            {faqs.map((faq, idx) => (
              <li key={idx} className="bg-white">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <Typography variant="body" className="font-bold text-charcoal text-[15px] pr-4">
                    {faq.q}
                  </Typography>
                  <span className={`text-deep-green transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-5 pt-0 text-charcoal/70 text-[14px] leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const faqs = [
  {
    q: "Is my donation tax-deductible?",
    a: "Tax benefits under Section 80G are available only for eligible campaigns. The applicable tax benefit details are displayed clearly on the campaign page before you donate."
  },
  {
    q: "What fees does KNT World Welfare Foundation charge?",
    a: "We believe in maximum impact. We charge 0% platform fees. Only standard payment gateway charges apply."
  },
  {
    q: "How do I know my donation is reaching the right person?",
    a: "We conduct strict verification of all beneficiaries, including physical document checks and medical validations before approving any campaign."
  },
  {
    q: "Can I donate from outside India?",
    a: "Yes, we accept international donations through secure payment gateways that support global credit/debit cards."
  },
  {
    q: "Can I donate anonymously?",
    a: "Yes, you can choose to hide your name from the public supporters list while making a donation."
  },
  {
    q: "How can I report a concern about a fundraiser?",
    a: "If you notice anything suspicious, please contact us directly. We take fraud very seriously and will investigate immediately."
  },
  {
    q: "How can I contact the foundation if I need help?",
    a: "You can reach out to us via the Contact Us page, email us at support@kntfoundation.org, or call our official helpline."
  }
];
