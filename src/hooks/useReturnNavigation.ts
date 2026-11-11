import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Preserves originating list tab, filters, search query, and sort order
 * when navigating into and back out of record detail views or side sheets.
 */
export function useReturnNavigation(defaultFallback: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stateFrom = (location.state as { from?: string } | null)?.from;
  const queryFrom = searchParams.get('from');
  const originUrl = stateFrom || queryFrom || defaultFallback;

  const goBack = (preferredFallback?: string) => {
    const target = stateFrom || queryFrom || preferredFallback || defaultFallback;
    navigate(target);
  };

  const withOriginState = () => ({ state: { from: originUrl } });

  return { originUrl, goBack, withOriginState };
}
