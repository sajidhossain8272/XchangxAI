// --------------------------------------------------
// How It Works (3 Steps Guide)
// --------------------------------------------------
const STEPS = [
{ num: "1", title: "Choose Send/Receive", desc: "Select which platform you’re sending from and where you want to receive." },
{ num: "2", title: "Confirm Details", desc: "Enter the amount and confirm exchange details before processing." },
{ num: "3", title: "Get Funds Instantly", desc: "Your funds are delivered securely and quickly to your chosen method." },
];


export function HowItWorks() {
return (
<section className="mx-auto max-w-5xl px-4 py-12">
<h2 className="mb-8 text-center text-2xl font-bold text-gray-900">How It Works</h2>
<div className="grid gap-6 sm:grid-cols-3">
{STEPS.map((s, i) => (
<div key={i} className="relative flex flex-col items-center rounded-2xl bg-white/70 p-6 shadow ring-1 ring-gray-100 backdrop-blur">
<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">{s.num}</div>
<h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
<p className="mt-2 text-sm text-gray-600 text-center">{s.desc}</p>
</div>
))}
</div>
</section>
);
}