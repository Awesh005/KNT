import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.subject ? `Subject: ${formData.subject}\n\n${formData.message}` : formData.message
      };
      
      const { default: api } = await import('@/lib/axios');
      await api.post('/enquiries', payload);
      
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-charcoal/5 flex flex-col"
    >
      <Typography variant="h2" className="text-2xl font-bold text-deep-green mb-3">
        Send Us a Message
      </Typography>
      <p className="text-charcoal/80 mb-8 text-base font-medium">
        Fill out the form below and our team will get in touch with you shortly.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
        <div>
          <label htmlFor="name" className="block text-charcoal text-sm font-bold mb-1.5">Your Name *</label>
          <input 
            type="text" 
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border-0 ring-1 ring-charcoal/10 focus:ring-2 focus:ring-deep-green shadow-sm outline-none transition-shadow text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-charcoal text-sm font-bold mb-1.5">Email Address *</label>
          <input 
            type="email" 
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border-0 ring-1 ring-charcoal/10 focus:ring-2 focus:ring-deep-green shadow-sm outline-none transition-shadow text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-charcoal text-sm font-bold mb-1.5">Contact Number</label>
          <input 
            type="tel" 
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., +91 9876543210"
            className="w-full px-4 py-2.5 rounded-xl border-0 ring-1 ring-charcoal/10 focus:ring-2 focus:ring-deep-green shadow-sm outline-none transition-shadow text-sm"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-charcoal text-sm font-bold mb-1.5">Subject</label>
          <input 
            type="text" 
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="E.g., Partnership Inquiry, Donation Question"
            className="w-full px-4 py-2.5 rounded-xl border-0 ring-1 ring-charcoal/10 focus:ring-2 focus:ring-deep-green shadow-sm outline-none transition-shadow text-sm"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label htmlFor="message" className="block text-charcoal text-sm font-bold mb-1.5">Your Message *</label>
          <textarea 
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message here..."
            className="w-full flex-1 min-h-[100px] px-4 py-3 rounded-xl border-0 ring-1 ring-charcoal/10 focus:ring-2 focus:ring-deep-green shadow-sm outline-none transition-shadow resize-none text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-2 bg-goldenrod hover:bg-deep-green text-white font-bold text-base py-3.5 px-8 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
          {!isSubmitting && <Send className="w-5 h-5" />}
        </button>
      </form>
    </motion.div>
  );
}
