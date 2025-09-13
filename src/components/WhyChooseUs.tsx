// --------------------------------------------------
// Why Choose Us (USP Highlights)
// --------------------------------------------------
const USPS = [
  {
    icon: "⚡",
    title: "Instant Exchange",
    desc: "Funds move within minutes to your chosen platform.",
  },
  {
    icon: "🔒",
    title: "Secure & Verified",
    desc: "Protected with SSL, verified accounts, and safe transfers.",
  },
  {
    icon: "💰",
    title: "Best Rates",
    desc: "Competitive rates updated live for maximum value.",
  },
  {
    icon: "🕑",
    title: "24/7 Support",
    desc: "Always available whenever you need help.",
  },
];

export function WhyChooseUs() {
  return (
    <section className='mx-auto max-w-6xl px-4 py-12'>
      <h2 className='mb-8 text-center text-2xl font-bold text-gray-900'>
        Why Choose Us
      </h2>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {USPS.map((u, i) => (
          <div
            key={i}
            className='rounded-2xl bg-white/70 p-6 shadow ring-1 ring-gray-100 backdrop-blur'
          >
            <div className='mb-3 text-3xl'>{u.icon}</div>
            <h3 className='text-lg font-semibold text-gray-900'>{u.title}</h3>
            <p className='mt-2 text-sm text-gray-600'>{u.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
