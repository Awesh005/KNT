import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';

const DEFAULT_TESTIMONIALS = [
  { name: 'Rahul Sharma', location: 'Delhi', review: "KNT World Welfare Foundation made it incredibly easy to raise funds for my father's surgery. The transparency is unmatched.", rating: 5 },
  { name: 'Anjali Verma', location: 'Mumbai', review: 'I donate regularly because I know exactly where my money is going. The platform is secure and trustworthy.', rating: 5 },
  { name: 'Dr. Ramesh', location: 'Bangalore', review: 'A fantastic platform bridging the gap between those who need help and those who want to give.', rating: 5 },
];

export function TestimonialsCMS() {
  const { data, mutate } = useSWR('/cms/global/testimonials', fetcher);
  const [items, setItems] = useState(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    if (Array.isArray(data?.content) && data.content.length > 0) {
      setItems(data.content);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      mutate({ content: items }, false);
      await api.put('/cms/global/testimonials', { content: items });
      toast.success('Testimonials saved');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
      mutate();
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Home Testimonials CMS</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">Manage testimonials shown on the homepage.</Typography>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setItems([...items, { name: '', location: '', review: '', rating: 5 }])}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
          <Button onClick={handleSave} className="bg-goldenrod hover:bg-yellow-600 text-white">Save Changes</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-3xl border border-charcoal/10 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-charcoal">Testimonial {index + 1}</span>
              <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} placeholder="Name" className="px-4 py-3 rounded-xl border border-charcoal/20" />
              <input value={item.location} onChange={(e) => updateItem(index, 'location', e.target.value)} placeholder="Location" className="px-4 py-3 rounded-xl border border-charcoal/20" />
            </div>
            <textarea value={item.review} onChange={(e) => updateItem(index, 'review', e.target.value)} placeholder="Review" className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-charcoal/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
