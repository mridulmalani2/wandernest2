export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  faqs: FAQ[];
}

// Payment-related FAQs
export const paymentFAQs: FAQ[] = [
  {
    question: "How does payment between tourists and students work?",
    answer:
      "TourWiseCo is only a marketplace connector. Payments are agreed directly between you and the student guide. We do not handle or guarantee payments.",
  },
  {
    question: "Can I choose a guide from my home country?",
    answer:
      "Absolutely! Many travelers prefer connecting with guides from their home country for added comfort, shared cultural context, and language familiarity. You can specify your preferred nationality during booking, or leave it blank to explore all available guides in your destination.",
  },
  {
    question: "How are student guides verified?",
    answer:
      "All guides are verified university students. We check their enrollment and basic identity before listing them on the platform.",
  },
  {
    question: "Can I cancel or reschedule a tour?",
    answer:
      "You can cancel or reschedule directly with your guide based on the terms you both agree to. We recommend confirming details in writing.",
  },
  {
    question: "Is TourWiseCo responsible for the quality of the tour?",
    answer:
      "We are not responsible for the quality of the service or safety during the tour. Please review guide profiles and communicate expectations clearly.",
  },
];

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
    title: "Payment & Trust",
    faqs: paymentFAQs,
  },
  {
    title: "For Students",
    faqs: studentFAQs,
  },
];
