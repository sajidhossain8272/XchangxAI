

import { useState } from "react";

// --------------------------------------------------
const FAQS = [
{ q: "How long does exchange take?", a: "Most exchanges complete within 5–10 minutes depending on network speed." },
{ q: "What are your fees?", a: "We charge a small destination fee (0.2%–0.9%) which is shown upfront before you confirm." },
{ q: "Is KYC required?", a: "Basic exchanges don’t need KYC, but larger amounts may require verification for security." },
];


function FAQItem({ q, a }: { q: string; a: string }) {
const [open, setOpen] = useState(false);
return (
<div className="border-b py-3">
<button
className="flex w-full items-center justify-between text-left text-gray-900"
onClick={() => setOpen(!open)}
>
<span className="font-medium">{q}</span>
<span className="ml-2 text-xl">{open ? "−" : "+"}</span>
</button>
{open && <p className="mt-2 text-sm text-gray-600">{a}</p>}
</div>
);
}


export function FAQSection() {
return (
<section className="mx-auto max-w-3xl px-4 py-12">
<h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
<div className="rounded-2xl bg-white/70 p-6 shadow ring-1 ring-gray-100 backdrop-blur">
{FAQS.map((f, i) => (
<FAQItem key={i} q={f.q} a={f.a} />
))}
</div>
</section>
);
}