import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Typography } from '@/components/common/Typography';
import { Mail, Lock } from 'lucide-react';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fog-gray p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Typography Section */}
        <section className="space-y-6">
          <Typography variant="overline" className="border-b border-charcoal/10 pb-2">Typography</Typography>
          <div className="space-y-4">
            <Typography variant="h1">Heading 1: Building Trust</Typography>
            <Typography variant="h2">Heading 2: Crowdfunding</Typography>
            <Typography variant="h3">Heading 3: Support a Cause</Typography>
            <Typography variant="body" className="max-w-2xl">
              Body Text: This is an example of the standard body text used across the platform. It has a relaxed line height and uses a soft charcoal color for better readability on long texts, creating an elegant editorial feel.
            </Typography>
            <Typography variant="muted">Muted Text: Used for helper text or secondary information.</Typography>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <Typography variant="overline" className="border-b border-charcoal/10 pb-2">Buttons</Typography>
          <div className="flex flex-wrap gap-4 items-end">
            <Button variant="primary" size="lg">Donate Now</Button>
            <Button variant="secondary" size="md">Share Campaign</Button>
            <Button variant="outline" size="sm">Cancel</Button>
            <Button variant="ghost">Learn More</Button>
            <Button isLoading>Processing...</Button>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <Typography variant="overline" className="border-b border-charcoal/10 pb-2">Inputs</Typography>
          <div className="grid md:grid-cols-2 gap-8">
            <Input label="Email Address" placeholder="hello@example.com" icon={<Mail className="w-4 h-4" />} />
            <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} error="Password is too short" />
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <Typography variant="overline" className="border-b border-charcoal/10 pb-2">Cards</Typography>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Typography variant="h3">Save Little Aarav</Typography>
                <Typography variant="muted" className="mt-1">Medical Emergency • Mumbai</Typography>
              </CardHeader>
              <CardBody>
                <Typography variant="body">
                  Aarav needs urgent open-heart surgery. His parents have exhausted all their savings and need your help.
                </Typography>
              </CardBody>
              <CardFooter className="flex justify-between items-center">
                <Typography variant="h4" className="text-deep-green">₹2.5L <span className="text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-charcoal/50 ml-1">raised</span></Typography>
                <Button size="sm">Donate</Button>
              </CardFooter>
            </Card>

            <Card className="bg-deep-green border-charcoal/20">
              <CardHeader className="border-white/10">
                <Typography variant="h3" className="!text-white">Join Membership</Typography>
                <Typography variant="muted" className="mt-1 !text-goldenrod">Support our foundation</Typography>
              </CardHeader>
              <CardBody>
                <Typography variant="body" className="!text-white/70">
                  Become a monthly supporter and help us continue our mission of providing medical and social welfare across the country.
                </Typography>
              </CardBody>
              <CardFooter className="bg-white/5 border-white/10 flex justify-end">
                <Button variant="primary" size="sm">Join Now</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Modals Section */}
        <section className="space-y-6">
          <Typography variant="overline" className="border-b border-charcoal/10 pb-2">Modals</Typography>
          <div>
            <Button onClick={() => setIsModalOpen(true)}>Open Donation Modal</Button>
          </div>
          
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            title="Make a Donation"
          >
            <div className="space-y-6">
              <Typography variant="body">
                Thank you for choosing to support this cause. Every contribution makes a huge difference.
              </Typography>
              <Input label="Amount (₹)" placeholder="Enter amount" type="number" />
              <div className="flex justify-end gap-3 pt-6 border-t border-charcoal/10 mt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button>Proceed</Button>
              </div>
            </div>
          </Modal>
        </section>

      </div>
    </div>
  );
}
