export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Report not found</h1>
      <p className="mt-4 text-slate-600">
        This scan doesn&apos;t exist or may have been removed.
      </p>
      <a
        href="/"
        className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Run a new scan
      </a>
    </main>
  );
}
