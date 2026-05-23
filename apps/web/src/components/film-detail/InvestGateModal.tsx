'use client';

import {
  ParticipationGateModal,
  type ParticipationGateVariant,
} from '@/components/film-detail/ParticipationGateModal';

interface InvestGateModalProps {
  variant: ParticipationGateVariant;
  onClose: () => void;
  signInCallbackUrl?: string;
}

/** @deprecated Use ParticipationGateModal with purpose="invest" */
export function InvestGateModal(props: InvestGateModalProps) {
  return <ParticipationGateModal {...props} purpose="invest" />;
}
