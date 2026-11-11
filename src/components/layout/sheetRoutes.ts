const JOB_WORKSPACE = /^\/jobs\/[^/]+$/;

export function sheetParent(pathname: string): string | null {
  if (pathname === '/sales/customers') return null;
  if (/^\/sales\/customers\/[^/]+/.test(pathname)) return '/sales?tab=customers';
  if (/^\/sales\/rfq/.test(pathname)) return '/sales?tab=rfqs';
  if (/^\/sales\/quotation/.test(pathname)) return '/sales?tab=rfqs';
  if (pathname.startsWith('/sales/')) return '/sales?tab=pos';
  if (/^\/suppliers\/[^/]+/.test(pathname)) return '/suppliers';
  if (/^\/procurement\/quote/.test(pathname) || /^\/procurement\/supplier-rfq/.test(pathname)) return '/procurement?tab=quotes';
  if (/^\/procurement\/spo/.test(pathname)) return '/procurement?tab=spo';
  if (/^\/procurement\/grn/.test(pathname)) return '/procurement?tab=grn';
  if (/^\/procurement\/pr/.test(pathname)) return '/procurement?tab=pr';
  if (pathname.startsWith('/procurement/')) return '/procurement?tab=pr';
  if (pathname.startsWith('/inventory/')) return '/inventory';
  if (/^\/jobs\/[^/]+\/stage\//.test(pathname)) {
    return pathname.replace(/\/stage\/.*$/, '');
  }
  if (JOB_WORKSPACE.test(pathname)) return null;
  if (pathname.startsWith('/quality/')) return '/quality';
  if (pathname.startsWith('/assets/')) return '/assets';
  if (/^\/dispatch\/[^/]+/.test(pathname)) return '/dispatch';
  if (pathname.startsWith('/finance/')) return '/finance';
  if (/^\/documents\/[^/]+/.test(pathname)) return '/documents';
  return null;
}
