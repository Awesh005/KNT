import { useState, useEffect } from 'react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { CheckCircle2, Trash2 } from 'lucide-react';

const defaultSettings = {
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
  paymentQRUrl: ''
};

export function SettingsPage() {
  const { data, mutate } = useSWR('/cms/global/settings', fetcher);
  const initialSettings = {
    ...defaultSettings,
    ...(data?.content || {}),
    socialLinks: {
      ...defaultSettings.socialLinks,
      ...(data?.content?.socialLinks || {})
    }
  };
  
  const [settings, setSettings] = useState(initialSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (data?.content) {
      setSettings({
        ...defaultSettings,
        ...data.content,
        socialLinks: {
          ...defaultSettings.socialLinks,
          ...(data.content.socialLinks || {})
        }
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('social_')) {
      const socialKey = field.split('_')[1];
      setSettings({
        ...settings,
        socialLinks: {
          ...settings.socialLinks,
          [socialKey]: value
        }
      });
    } else {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('paymentQRUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      mutate({ content: settings }, false);
      await api.put('/cms/global/settings', { content: settings });
      mutate();
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update settings', error);
      mutate();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Site Settings
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage global information and configurations for the website.
          </Typography>
        </div>
        <Button onClick={handleSave} className="bg-goldenrod hover:bg-yellow-600 text-white min-w-[140px]">
          {isSaved ? <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</span> : 'Save Settings'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 md:p-8 space-y-8">
        
        {/* Social Links */}
        <div>
          <Typography variant="h3" className="mb-4 text-lg border-b border-charcoal/10 pb-2">Social Media Links</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Facebook</label>
              <input 
                type="url" 
                value={settings.socialLinks.facebook} 
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Twitter</label>
              <input 
                type="url" 
                value={settings.socialLinks.twitter} 
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Instagram</label>
              <input 
                type="url" 
                value={settings.socialLinks.instagram} 
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">LinkedIn</label>
              <input 
                type="url" 
                value={settings.socialLinks.linkedin} 
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green focus:bg-white transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div>
          <Typography variant="h3" className="mb-4 text-lg border-b border-charcoal/10 pb-2">Payment Configuration</Typography>
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">UPI / Payment QR Code Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {settings.paymentQRUrl && (
                <div className="relative group">
                  <img src={settings.paymentQRUrl} alt="QR Code" className="w-24 h-24 object-contain border border-charcoal/10 rounded-xl bg-gray-50 p-2" />
                  <button
                    onClick={() => handleChange('paymentQRUrl', '')}
                    className="absolute -top-2 -right-2 p-1.5 bg-white border border-charcoal/10 text-red-500 rounded-full shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove QR Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center flex-1 w-full h-24 border-2 border-charcoal/15 border-dashed rounded-xl cursor-pointer bg-white hover:bg-charcoal/5 transition-colors">
                <span className="text-sm font-medium text-charcoal/70">Click to upload QR Image</span>
                <span className="text-xs text-charcoal/40 mt-1">PNG, JPG up to 5MB</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-xs text-charcoal/50 mt-3">This QR code will be displayed to users making offline or UPI donations.</p>
          </div>
        </div>

        <AdminTwoFactor />

      </div>
    </div>
  );
}

function AdminTwoFactor() {
  const { data: me } = useSWR('/auth/me', fetcher);
  const enabled = Boolean(me?.user?.totp_enabled);
  const [setup, setSetup] = useState<any>(null);
  const [code, setCode] = useState('');

  const start = async () => {
    const res = await api.post('/auth/2fa/setup');
    setSetup(res.data.data);
  };
  const enable = async () => {
    await api.post('/auth/2fa/enable', { code });
    window.location.reload();
  };
  const disable = async () => {
    await api.post('/auth/2fa/disable', { code });
    window.location.reload();
  };

  return (
    <div>
      <Typography variant="h3" className="mb-4 text-lg border-b border-charcoal/10 pb-2">Admin 2FA</Typography>
      <p className="text-sm text-charcoal/60 mb-3">Optional authenticator app for this admin account.</p>
      {enabled ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-deep-green">2FA is on.</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code to disable" className="border rounded-xl px-3 py-2 text-sm" />
          <Button variant="outline" onClick={disable}>Disable 2FA</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {!setup && <Button onClick={start}>Set up authenticator</Button>}
          {setup && (
            <>
              {setup.qrDataUrl && <img src={setup.qrDataUrl} alt="2FA QR" className="w-40 h-40" />}
              <p className="text-xs font-mono break-all">{setup.secret}</p>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" className="border rounded-xl px-3 py-2 text-sm" />
              <Button onClick={enable}>Enable 2FA</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
