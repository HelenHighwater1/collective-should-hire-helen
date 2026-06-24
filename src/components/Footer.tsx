export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl border-t border-dashed border-stone-300/70 pt-6 text-center space-y-2">
        <p className="text-base text-stone-400 sm:text-lg">
          Built by{' '}
          <a
            href="https://heyimhelen.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-hand transition-colors hover:text-blue"
          >
            Helen Highwater
          </a>
        </p>
        <p className="font-hand text-sm text-stone-400">
          Built as a portfolio project - not tax advice. Consult a CPA.
        </p>
      </div>
    </footer>
  )
}
