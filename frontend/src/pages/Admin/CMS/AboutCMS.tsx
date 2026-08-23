import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';

import { mergeCompanyDetails } from '@/config/org';

const DEFAULT_WHO_WE_ARE = {
  title: 'Who We Are',
  paragraphs: [
    'KNT World Welfare Foundation is a non-profit, non-religious and humanitarian organization committed to the holistic development of society. We work across key sectors including education, health, agriculture, women empowerment, child protection, elderly care, rural development, environment conservation, and spiritual enrichment.',
    'Our vision is to create an empowered, sustainable, and value-driven society where every individual has the opportunity to live with dignity and purpose.',
  ],
};

const DEFAULT_HIGHLIGHTS = [
  { text: 'Holistic Development Approach', icon: 'Heart' },
  { text: 'Focus on Rural & Underprivileged Communities', icon: 'Users' },
  { text: 'Sustainable & Environment-Friendly Initiatives', icon: 'Leaf' },
  { text: 'Value-Based Education & Spiritual Growth', icon: 'GraduationCap' },
  { text: 'Health, Wellness & Social Care', icon: 'Activity' },
  { text: 'Women & Child Empowerment', icon: 'Baby' },
  { text: 'Skill Development & Livelihood Creation', icon: 'Briefcase' },
  { text: 'Transparency, Integrity & Accountability', icon: 'ShieldCheck' },
];

export function AboutCMS() {
  const { data, mutate } = useSWR('/cms/about/main', fetcher);
  const [activeTab, setActiveTab] = useState<'legal' | 'who' | 'highlights'>('legal');
  const [companyDetails, setCompanyDetails] = useState<{ label: string; value: string; icon: string }[]>([]);
  const [whoWeAre, setWhoWeAre] = useState(DEFAULT_WHO_WE_ARE);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);

  useEffect(() => {
    const existingDetails = data?.content?.companyDetails || [];
    setCompanyDetails(mergeCompanyDetails(existingDetails));
    setWhoWeAre({ ...DEFAULT_WHO_WE_ARE, ...(data?.content?.whoWeAre || {}) });
    setHighlights(data?.content?.highlights?.length ? data.content.highlights : DEFAULT_HIGHLIGHTS);
  }, [data]);

  const handleSave = async () => {
    const newContent = {
      ...(data?.content || {}),
      companyDetails,
      whoWeAre,
      highlights,
    };
    try {
      mutate({ content: newContent }, false);
      await api.put('/cms/about/main', { content: newContent });
      toast.success('About page content saved successfully!');
      mutate();
    } catch (error) {
      console.error('Failed to save', error);
      toast.error('Failed to save changes.');
      mutate();
    }
  };

  const updateCompanyDetail = (index: number, value: string) => {
    const newDetails = [...companyDetails];
    newDetails[index] = { ...newDetails[index], value };
    setCompanyDetails(newDetails);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">About Page CMS</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">Manage legal info, Who We Are, and highlights.</Typography>
        </div>
        <Button onClick={handleSave} className="bg-goldenrod hover:bg-yellow-600 text-white">Save All Changes</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'legal', label: 'Legal Information' },
          { id: 'who', label: 'Who We Are' },
          { id: 'highlights', label: 'Highlights' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/70'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'legal' && (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
          <Typography variant="h3" className="mb-4">Company Details (Legal Information)</Typography>
          <div className="space-y-4">
            {companyDetails.map((detail, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="w-full sm:w-1/4 p-2 bg-gray-50 border border-charcoal/10 rounded-lg text-sm font-bold text-charcoal/80">{detail.label}</div>
                <textarea value={detail.value} onChange={(e) => updateCompanyDetail(index, e.target.value)} placeholder="Value" rows={2} className="flex-1 w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'who' && (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <input value={whoWeAre.title} onChange={(e) => setWhoWeAre({ ...whoWeAre, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 font-bold" placeholder="Section title" />
          {whoWeAre.paragraphs.map((paragraph: string, index: number) => (
            <textarea key={index} value={paragraph} onChange={(e) => {
              const paragraphs = [...whoWeAre.paragraphs];
              paragraphs[index] = e.target.value;
              setWhoWeAre({ ...whoWeAre, paragraphs });
            }} className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-charcoal/20" />
          ))}
        </div>
      )}

      {activeTab === 'highlights' && (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          {highlights.map((item, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-3">
              <input value={item.text} onChange={(e) => {
                const next = [...highlights];
                next[index] = { ...next[index], text: e.target.value };
                setHighlights(next);
              }} className="px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Highlight text" />
              <input value={item.icon} onChange={(e) => {
                const next = [...highlights];
                next[index] = { ...next[index], icon: e.target.value };
                setHighlights(next);
              }} className="px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Icon name (Heart, Users, Leaf...)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
