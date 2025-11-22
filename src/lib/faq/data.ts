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
    answer:
      "It's entirely up to you! You can choose when you're available and how many tourists you want to guide. Many students do 1-2 tours per month.",
  },
  {
    question: "Do I need to speak multiple languages?",
    answer:
      "Not required. English is often enough, but knowing other languages can help you connect with more tourists.",
  },
  {
    question: "What about exam periods?",
    answer:
      "No problem! You control your schedule. Simply mark yourself as unavailable during busy academic periods.",
  },
  {
    question: "How do I get paid?",
    answer:
      "You negotiate rates directly with tourists. Payment is handled between you and them - we're just the connector.",
  },
];

// All FAQ categories
export const faqCategories: FAQCategory[] = [
  {
    title: "For Students",
    faqs: studentFAQs,
  },
];
