export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  faqs: FAQ[];
}

// Student-related FAQs (existing from student page)
export const studentFAQs: FAQ[] = [
  {
    question: "How much time do I need to commit?",
    answer: "Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime. You're in complete control of when you're available to guide.",
  },
  {
    question: "Do I need to speak multiple languages?",
    answer: "No! We match you with visitors from your home country, so you can communicate in your native language. This makes the experience more authentic and comfortable for everyone.",
  },
  {
    question: "What about exam periods?",
    answer: "You can mark specific dates or periods when you're unavailable (like exam weeks or holidays). Simply update your availability calendar, and you won't receive requests during those times.",
  },
  {
    question: "How do I get paid?",
    answer: "You arrange payment directly with tourists. TourWiseCo is a marketplace connector only - we facilitate introductions but don't handle payments. You set your own rates and payment methods.",
  },
];

// All FAQ categories
export const faqCategories: FAQCategory[] = [
  {
    title: "For Students",
    faqs: studentFAQs,
  },
];
