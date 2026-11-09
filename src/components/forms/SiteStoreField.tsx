import React from 'react';
import { useStore } from '../../store';
import { DEFAULT_SITE_ID, DEFAULT_STORE_ID } from '../../domain/recordLists';

interface Props {
  siteId: string;
  storeId: string;
  onChange: (next: { siteId: string; siteName: string; storeId: string; storeName: string }) => void;
  label?: string;
  storeLabel?: string;
}

export default function SiteStoreField({ siteId, storeId, onChange, label = 'Site', storeLabel = 'Store' }: Props) {
  const { sites, storeLocations } = useStore();
  const activeSites = sites.filter(s => s.status !== 'inactive');
  const site = activeSites.find(s => s.id === siteId) ?? activeSites[0];
  const stores = storeLocations.filter(l => l.siteId === (site?.id ?? siteId));
  const store = stores.find(l => l.id === storeId) ?? stores[0];

  const emit = (nextSiteId: string, nextStoreId: string) => {
    const s = activeSites.find(x => x.id === nextSiteId) ?? activeSites[0];
    const options = storeLocations.filter(l => l.siteId === s?.id);
    const loc = options.find(l => l.id === nextStoreId) ?? options[0];
    if (!s || !loc) return;
    onChange({ siteId: s.id, siteName: s.name, storeId: loc.id, storeName: loc.name });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="block text-xs font-medium text-[var(--text-2)]">
        {label}
        <select
          className="eoss-input w-full mt-1"
          value={site?.id ?? DEFAULT_SITE_ID}
          onChange={e => emit(e.target.value, '')}
        >
          {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-medium text-[var(--text-2)]">
        {storeLabel}
        <select
          className="eoss-input w-full mt-1"
          value={store?.id ?? DEFAULT_STORE_ID}
          onChange={e => emit(site?.id ?? DEFAULT_SITE_ID, e.target.value)}
        >
          {stores.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>
    </div>
  );
}
