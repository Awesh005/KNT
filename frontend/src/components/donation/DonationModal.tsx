import { Modal } from '@/components/common/Modal';
import { DonationFlow } from '@/components/donation/DonationFlow';

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string | number;
}

export function DonationModal({ isOpen, onClose, campaignId }: DonationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Support this Cause" className="max-w-md">
      <DonationFlow campaignId={campaignId} onComplete={onClose} onCancel={onClose} />
    </Modal>
  );
}
