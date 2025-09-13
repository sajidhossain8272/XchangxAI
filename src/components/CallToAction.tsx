// --------------------------------------------------
// Call-To-Action Block
// --------------------------------------------------
export function CallToAction() {
  return (
    <section className='relative mx-auto max-w-4xl px-4 py-16'>
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-lime-400 to-lime-500 p-10 text-center text-white shadow-lg'>
        <h2 className='mb-4 text-2xl font-bold'>Ready to Exchange?</h2>
        <p className='mb-6 text-sm opacity-90'>
          Fast, secure, and reliable transactions available 24/7.
        </p>
        <a
          href='/exchange'
          className='inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100'
        >
          Start Exchange Now →
        </a>
      </div>
    </section>
  );
}
