import { useNavigate } from 'react-router';
import { HeartHandshake } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { CallToActionBanner } from '@/components/common/CallToActionBanner';

import { StudentHero } from '@/components/sections/student/StudentHero';
import { StudentPrograms } from '@/components/sections/student/StudentPrograms';
import type { Campaign } from '@/types';

export function StudentSupport() {
  const { data } = useSWR('/campaigns?category=Education&limit=10', fetcher);
  const campaigns: Campaign[] = (data?.campaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    story: c.story,
    coverImage: c.cover_image,
    targetAmount: Number(c.target_amount),
    raisedAmount: Number(c.raised_amount),
    deadline: c.deadline,
    status: c.status,
    createdBy: c.created_by,
    category: c.category,
    isUrgent: c.is_urgent,
    isFeatured: c.is_featured,
    createdAt: c.created_at,
    studentDetails: c.student_details
  }));
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light-green pb-24">
      <StudentHero />
      <StudentPrograms campaigns={campaigns} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <CallToActionBanner 
          title="Start a Fundraiser for Education" 
          subtitle="Empower bright minds. Create a campaign and help a student achieve their dreams today."
          buttonText="Start a Fundraiser"
          buttonIcon={<HeartHandshake className="w-5 h-5 mr-2" />}
          onButtonClick={() => navigate('/start-fundraiser')}
          className="rounded-3xl"
        />
      </div>
    </div>
  );
}
