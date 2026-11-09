/** Full-page exception: the job workspace is a multi-stage board, not a record form. */
const JOB_WORKSPACE = /^\/jobs\/[^/]+$/;

export function sheetParent(pathname: string): string | null {
  if (pathname === '/sales/customers') return null;
  if (/^\/sales\/customers\/[^/]+/.test(pathname)) return '/sales/customers';
  if (pathname.startsWith('/sales/')) return '/sales';
  if (/^\/suppliers\/[^/]+/.test(pathname)) return '/suppliers';
  if (pathname.startsWith('/procurement/')) return '/procurement';
  if (pathname.startsWith('/inventory/')) return '/inventory';
  if (/^\/jobs\/[^/]+\/stage\//.test(pathname)) {
    return pathname.replace(/\/stage\/.*$/, '');
  }
  if (JOB_WORKSPACE.test(pathname)) return null;
  if (pathname.startsWith('/quality/')) return '/quality';
  if (pathname.startsWith('/assets/')) return '/assets';
  if (/^\/dispatch\/[^/]+/.test(pathname)) return '/dispatch';
  if (pathname.startsWith('/finance/')) return '/finance';
  return null;
}
