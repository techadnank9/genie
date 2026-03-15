"use client";

import React from "react";

const features = [
  {
    title: "Wishful Search",
    copy: "Turn a plain-English request into a business hunt across local providers in seconds.",
  },
  {
    title: "Live Magic Calls",
    copy: "Genie rings real businesses, captures pricing, and tracks availability as the call unfolds.",
  },
  {
    title: "Golden Comparisons",
    copy: "See the strongest quote rise to the surface with summaries, pricing, and call history.",
  },
];

const pricing = [
  {
    name: "Street Market",
    price: "$0",
    detail: "Perfect for demos, testing, and hackathon magic.",
  },
  {
    name: "Sultan",
    price: "$29",
    detail: "For teams comparing providers every day with live calling and history.",
  },
  {
    name: "Palace",
    price: "Custom",
    detail: "Concierge deployment, private routing, and tailored Genie workflows.",
  },
];

const testimonials = [
  {
    quote:
      "It feels like having a magical operations assistant that can call five places while we focus on the customer.",
    author: "Nadia, founder",
  },
  {
    quote:
      "The call history and summaries gave us a polished demo in one night instead of a weekend of manual outreach.",
    author: "Yusuf, product lead",
  },
  {
    quote:
      "Genie makes procurement feel cinematic. The live dashboard is the first thing people ask to replay.",
    author: "Amina, hackathon judge",
  },
];

export function GenieShowcase() {
  return (
    <div className="relative mt-20 space-y-12 pb-16">
      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_12px_60px_rgba(12,9,37,0.32)]"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="text-xs uppercase tracking-[0.38em] text-amber-200/70">Feature</p>
            <h3 className="mt-4 font-['Cinzel_Decorative'] text-2xl text-amber-100">
              {feature.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-indigo-100/78">{feature.copy}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(40,27,82,0.8),rgba(10,13,38,0.9))] p-8 shadow-[0_30px_100px_rgba(6,5,24,0.45)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.38em] text-amber-200/70">Treasures</p>
            <h2 className="mt-3 font-['Cinzel_Decorative'] text-3xl text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-200 bg-clip-text md:text-4xl">
              Pricing with a palace glow
            </h2>
            <p className="mt-4 text-sm leading-7 text-indigo-100/78">
              Keep the hackathon MVP effortless now, then scale to full concierge workflows when
              the magic lands.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pricing.map((tier) => (
            <article
              key={tier.name}
              className="rounded-[1.8rem] border border-amber-300/15 bg-white/5 p-6 backdrop-blur-lg"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">{tier.name}</p>
              <p className="mt-4 text-4xl font-semibold text-amber-100">{tier.price}</p>
              <p className="mt-4 text-sm leading-7 text-indigo-100/78">{tier.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.author}
            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl"
          >
            <p className="text-sm leading-7 text-indigo-100/82">“{item.quote}”</p>
            <p className="mt-5 text-xs uppercase tracking-[0.34em] text-amber-200/70">
              {item.author}
            </p>
          </article>
        ))}
      </section>

      <footer className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-['Cinzel_Decorative'] text-2xl text-amber-100">Genie</p>
            <p className="mt-2 text-sm text-indigo-100/70">
              Midnight-cast business calling, wrapped in a magical concierge experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.28em] text-amber-200/70">
            <span>Hero</span>
            <span>Features</span>
            <span>Pricing</span>
            <span>Testimonials</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
