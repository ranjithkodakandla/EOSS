import type { Dispatch, GoodsReceipt, PurchaseRequisition, SupplierPO } from '../types';
import {
  DEFAULT_SITE_ID, DEFAULT_SITE_NAME, DEFAULT_STORE_ID, DEFAULT_STORE_NAME,
  GRN_STORE_ID, GRN_STORE_NAME, SHIP_STORE_ID, SHIP_STORE_NAME,
} from './recordLists';

type WithPlace = {
  purchaseReqs: PurchaseRequisition[];
  supplierPos: SupplierPO[];
  grns: GoodsReceipt[];
  dispatches: Dispatch[];
};

export function stampPlaces<T extends WithPlace>(data: T): T {
  return {
    ...data,
    purchaseReqs: data.purchaseReqs.map(pr => ({
      ...pr,
      deliverToSiteId: pr.deliverToSiteId ?? DEFAULT_SITE_ID,
      deliverToSiteName: pr.deliverToSiteName ?? DEFAULT_SITE_NAME,
      deliverToStoreId: pr.deliverToStoreId ?? DEFAULT_STORE_ID,
      deliverToStoreName: pr.deliverToStoreName ?? DEFAULT_STORE_NAME,
    })),
    supplierPos: data.supplierPos.map(po => ({
      ...po,
      deliverToSiteId: po.deliverToSiteId ?? DEFAULT_SITE_ID,
      deliverToSiteName: po.deliverToSiteName ?? DEFAULT_SITE_NAME,
      deliverToStoreId: po.deliverToStoreId ?? DEFAULT_STORE_ID,
      deliverToStoreName: po.deliverToStoreName ?? DEFAULT_STORE_NAME,
    })),
    grns: data.grns.map(g => ({
      ...g,
      siteId: g.siteId ?? DEFAULT_SITE_ID,
      siteName: g.siteName ?? DEFAULT_SITE_NAME,
      storeLocationId: g.storeLocationId ?? GRN_STORE_ID,
      storeLocationName: g.storeLocationName ?? GRN_STORE_NAME,
    })),
    dispatches: data.dispatches.map(d => ({
      ...d,
      sourceSiteId: d.sourceSiteId ?? DEFAULT_SITE_ID,
      sourceStoreLocationId: d.sourceStoreLocationId ?? SHIP_STORE_ID,
      sourceStoreLocationName: d.sourceStoreLocationName ?? SHIP_STORE_NAME,
    })),
  };
}

export function placeLabel(site?: string, store?: string) {
  if (site && store) return `${site} · ${store}`;
  return site || store || '—';
}
