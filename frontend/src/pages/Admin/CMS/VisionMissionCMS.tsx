import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';

const DEFAULT_CONTENT = {
  vision: {
    badge: 'Our Vision',
    heading: 'Towards an Equitable, Educated, and Prosperous Society',
    quote: 'To create a world where every individual has access to education, healthcare, dignity, security, equal opportunity, and self-reliance, ensuring sustainable development based on the principles of humanity, compassion, and social justice.',
    description: 'This vision is not limited to India alone, but is inspired by the spirit of global human welfare. The foundation believes that true progress is only possible when the weakest member of society is integrated into the mainstream of development.',
  },
  mission: {
    badge: 'Our Mission',
    heading: 'Service to Humanity and Sustainable Development',
    intro: 'The mission of KNT WORLD WELFARE FOUNDATION is—',
    points: [
      'To improve the standard of living of the deprived and weaker sections of society.',
      'To promote education, health, and skill development.',
      'To work for the welfare of women, children, youth, and senior citizens.',
      'To encourage environmental conservation and sustainable development.',
      'To accelerate social change through community participation.',
      'To develop a network of humanitarian cooperation at national and international levels.',
    ],
  },
};

export function VisionMissionCMS() {
  const { data, mutate } = useSWR('/cms/global/vision-mission', fetcher);
  const [form, setForm] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    if (data?.content) {
      setForm({ ...DEFAULT_CONTENT, ...data.content });
    }
  }, [data]);

  const handleSave = async () => {
    try {
      mutate({ content: form }, false);
      await api.put('/cms/global/vision-mission', { content: form });
      toast.success('Vision & Mission saved');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
      mutate();
    }
  };

  const updateMissionPoint = (index: number, value: string) => {
    const points = [...form.mission.points];
    points[index] = value;
    setForm({ ...form, mission: { ...form.mission, points } });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Vision & Mission CMS</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">Edit the public Vision & Mission page content.</Typography>
        </div>
        <Button onClick={handleSave} className="bg-goldenrod hover:bg-yellow-600 text-white">Save Changes</Button>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 p-6 space-y-4">
        <Typography variant="h3" className="text-deep-green">Vision</Typography>
        {['badge', 'heading', 'quote', 'description'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-bold text-charcoal mb-2 capitalize">{field}</label>
            <textarea
              value={(form.vision as any)[field]}
              onChange={(e) => setForm({ ...form, vision: { ...form.vision, [field]: e.target.value } })}
              className="w-full min-h-[90px] px-4 py-3 rounded-xl border border-charcoal/20"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 p-6 space-y-4">
        <Typography variant="h3" className="text-deep-green">Mission</Typography>
        {['badge', 'heading', 'intro'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-bold text-charcoal mb-2 capitalize">{field}</label>
            <textarea
              value={(form.mission as any)[field]}
              onChange={(e) => setForm({ ...form, mission: { ...form.mission, [field]: e.target.value } })}
              className="w-full min-h-[70px] px-4 py-3 rounded-xl border border-charcoal/20"
            />
          </div>
        ))}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-charcoal">Mission points</label>
          {form.mission.points.map((point: string, index: number) => (
            <textarea
              key={index}
              value={point}
              onChange={(e) => updateMissionPoint(index, e.target.value)}
              className="w-full min-h-[60px] px-4 py-3 rounded-xl border border-charcoal/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
