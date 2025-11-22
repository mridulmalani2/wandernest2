// Visual: Using design system border radii, shadows, and typography
import type { FAQ } from "@/lib/faq/data";

interface FAQAccordionProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

export default function FAQAccordion({
  faqs,
  title = "Common Questions",
  className = "",
}: FAQAccordionProps) {
  return (
    <section
      className={`mx-auto max-w-5xl rounded-2xl bg-white/30 backdrop-blur-xl p-10 md:p-14 shadow-elevated border border-white/40 ${className}`}
    >
      <h2 className="text-center text-3xl md:text-4xl font-bold font-serif mb-8 md:mb-10">
        {title}
      </h2>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-xl border border-white/50 bg-white/20 px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-white/30 shadow-soft"
          >
            <summary className="flex items-center justify-between list-none text-lg md:text-xl font-medium">
              <span>{item.question}</span>
              <span className="ml-4 text-xl transition-transform duration-200 group-open:rotate-90">
                ▶
              </span>
            </summary>

            <div className="mt-3 text-sm leading-relaxed text-gray-800">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
