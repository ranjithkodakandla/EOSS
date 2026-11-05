import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { onboarding } = useStore();
  if (onboarding.status !== 'complete') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
