'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="tourist" />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            {/* Back Link */}
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/30 mb-8"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>

            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-white">
                Last Updated: November 29, 2025
              </p>
            </div>

            {/* Privacy Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="glass-card-dark rounded-xl shadow-premium border border-white/10 p-8 md:p-12 space-y-8">

                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className='text-white'>
                      TourWiseCo ("we," "us," "our," or "the Platform") is committed to protecting your privacy and ensuring transparency in how we collect, use, store, and share your personal data. This Privacy Policy explains our data practices in compliance with the General Data Protection Regulation (GDPR) (EU) 2016/679, the UK GDPR as incorporated into the Data Protection Act 2018, the ePrivacy Directive 2002/58/EC, and other applicable data protection laws.
                    </p>
                    <p className='text-white'>
                      This Privacy Policy applies to all users of the TourWiseCo Platform, including tourists seeking local guide services ("Tourists") and university students offering guide services ("Student Guides" or "Guides").
                    </p>
                    <p className='text-white'>
                      By using our Platform, you acknowledge that you have read, understood, and agree to this Privacy Policy. If you do not agree with our practices, please do not use our Services.
                    </p>
                  </div>
                </section>

                {/* Data Controller */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Data Controller</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className='text-white'>
                      For the purposes of the GDPR and UK GDPR, TourWiseCo is the data controller responsible for your personal data collected through the Platform.
                    </p>
                    <p className='text-white'>
                      <strong>Contact Information:</strong><br />
                      You may contact us regarding data protection matters through the contact form available on our Platform, or by contacting our Data Protection Officer (DPO) through the same channel.
                    </p>
                    <p className='text-white'>
                      <strong>EU Representative:</strong><br />
                      TourWiseCo operates in France. Our primary operating location is Paris, France.
                    </p>
                    <p className='text-white'>
                      <strong>UK Representative:</strong><br />
                      TourWiseCo operates in the United Kingdom through our London operations.
                    </p>
                  </div>
                </section>

                {/* Personal Data Collection */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. Personal Data We Collect</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className='text-white'>
                      We collect different categories of personal data depending on how you interact with our Platform.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Data Collected from All Users</h3>
                    <p className='text-white'><strong>Account and Profile Information:</strong></p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email address (required for account creation and authentication)</li>
                      <li>Name (first name and last name)</li>
                      <li>User type designation (Tourist or Student Guide)</li>
                      <li>Account credentials (password stored in hashed format)</li>
                      <li>Authentication tokens and session data</li>
                    </ul>

                    <p className="mt-4 text-white"><strong>Communication Data:</strong></p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Messages exchanged through our Platform messaging system</li>
                      <li>Contact form submissions and support inquiries</li>
                      <li>Email communications (including magic link authentication emails)</li>
                    </ul>

                    <p className="mt-4 text-white"><strong>Technical and Usage Data:</strong></p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>IP address</li>
                      <li>Browser type and version</li>
                      <li>Device information (operating system, device type, unique device identifiers)</li>
                      <li>Time zone setting and location data (country/city level)</li>
                      <li>Pages visited, features used, and time spent on the Platform</li>
                      <li>Referral source and clickstream data</li>
                      <li>Log files and error reports</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Additional Data from Tourists</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Phone number (optional)</li>
                      <li>WhatsApp number (optional)</li>
                      <li>Travel dates and destination cities</li>
                      <li>Trip preferences (time of day, group size, group type)</li>
                      <li>Service preferences (guided tours vs. itinerary assistance)</li>
                      <li>Interests and activity preferences</li>
                      <li>Budget information</li>
                      <li>Preferred languages and guide characteristics</li>
                      <li>Accessibility requirements</li>
                      <li>Special requests and trip notes</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Additional Data from Student Guides</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>University name and enrollment status</li>
                      <li>Student identification documents (student ID card for verification)</li>
                      <li>Date of birth</li>
                      <li>Nationality</li>
                      <li>Languages spoken and proficiency levels</li>
                      <li>Areas of expertise and local knowledge</li>
                      <li>Service offerings and availability schedule</li>
                      <li>Profile biography and cover letter</li>
                      <li>Interests and hobbies</li>
                      <li>Preferred service types and tourist preferences</li>
                      <li>Safety compliance acknowledgments</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Data We Do NOT Collect</h3>
                    <p className='text-white'>
                      We do NOT collect or process:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Payment card information (PCI DSS data) – all payments occur directly between users</li>
                      <li>Government-issued ID numbers (passports, national ID cards, social security numbers)</li>
                      <li>Financial account information (bank accounts, IBAN)</li>
                      <li>Sensitive personal data as defined under GDPR Article 9 (racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data for identification, health data, sex life, or sexual orientation) – except where voluntarily provided by users in free-text fields</li>
                    </ul>
                  </div>
                </section>

                {/* Legal Basis */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing Personal Data</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className='text-white'>
                      Under the GDPR and UK GDPR, we must have a lawful basis to process your personal data. We process your personal data on the following legal grounds:
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Performance of Contract (GDPR Article 6(1)(b))</h3>
                    <p className='text-white'>
                      Processing is necessary for the performance of our Terms of Service contract with you, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Creating and managing your account</li>
                      <li>Facilitating connections between Tourists and Student Guides</li>
                      <li>Operating our matching algorithm based on preferences</li>
                      <li>Providing our Platform messaging functionality</li>
                      <li>Delivering authentication services (magic links, OAuth)</li>
                      <li>Enforcing our Terms of Service</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Legitimate Interests (GDPR Article 6(1)(f))</h3>
                    <p className='text-white'>
                      Processing is necessary for our legitimate business interests, where such interests are not overridden by your data protection rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Platform security and fraud prevention:</strong> Monitoring for suspicious activity, preventing unauthorized access, detecting fraud</li>
                      <li><strong>Service improvement:</strong> Analyzing usage patterns, conducting user research, optimizing features and user experience</li>
                      <li><strong>Customer support:</strong> Responding to inquiries, resolving issues, providing technical assistance</li>
                      <li><strong>Business analytics:</strong> Generating aggregated statistics, understanding user demographics, evaluating Platform performance</li>
                      <li><strong>Legal compliance and safety:</strong> Investigating violations of Terms of Service, responding to legal requests, protecting user safety</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Consent (GDPR Article 6(1)(a))</h3>
                    <p className='text-white'>
                      For certain processing activities, we obtain your explicit consent:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Non-essential cookies and tracking technologies (managed through our cookie consent banner)</li>
                      <li>Marketing communications (where required by law)</li>
                      <li>Sharing profile information with matched users</li>
                    </ul>
                    <p className='text-white'>
                      You have the right to withdraw consent at any time. Withdrawal does not affect the lawfulness of processing based on consent before withdrawal.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.4 Legal Obligation (GDPR Article 6(1)(c))</h3>
                    <p className='text-white'>
                      Processing is necessary to comply with legal obligations, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Responding to lawful requests from law enforcement and regulatory authorities</li>
                      <li>Complying with tax and accounting regulations</li>
                      <li>Retaining records as required by applicable laws</li>
                      <li>Reporting illegal activity as mandated by law</li>
                    </ul>
                  </div>
                </section>

                {/* How We Use Data */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. How We Use Your Personal Data</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className='text-white'>
                      We use your personal data for the following purposes:
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Core Platform Services</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Account creation, authentication, and management</li>
                      <li>User verification (student ID validation for Student Guides)</li>
                      <li>Matching Tourists with suitable Student Guides based on preferences and availability</li>
                      <li>Facilitating communication between Tourists and Student Guides</li>
                      <li>Displaying user profiles to matched parties</li>
                      <li>Sending transactional emails (account verification, match notifications, system updates)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Platform Operation and Improvement</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Monitoring and analyzing Platform usage and trends</li>
                      <li>Conducting user research and surveys</li>
                      <li>Testing new features and improvements</li>
                      <li>Optimizing matching algorithm performance</li>
                      <li>Improving user interface and experience</li>
                      <li>Generating aggregated, anonymized statistics</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Security and Fraud Prevention</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Detecting and preventing fraudulent activity</li>
                      <li>Monitoring for Terms of Service violations</li>
                      <li>Protecting against spam, harassment, and malicious behavior</li>
                      <li>Investigating security incidents</li>
                      <li>Enforcing our Terms of Service</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.4 Customer Support</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Responding to support inquiries and requests</li>
                      <li>Resolving technical issues</li>
                      <li>Investigating and addressing user complaints</li>
                      <li>Providing guidance on Platform features</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.5 Legal Compliance</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Complying with legal obligations and regulatory requirements</li>
                      <li>Responding to lawful requests from authorities</li>
                      <li>Establishing, exercising, or defending legal claims</li>
                      <li>Enforcing our rights and agreements</li>
                    </ul>
                  </div>
                </section>

                {/* Data Sharing */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. How We Share Your Personal Data</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      We do not sell your personal data to third parties. We share your personal data only in the limited circumstances described below:
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 With Other Users</h3>
                    <p className='text-white'>
                      When our matching algorithm identifies a suitable match, we share relevant profile information:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Tourist to Student Guide:</strong> Name, trip details, preferences, contact method preference, and any information you include in your booking request</li>
                      <li><strong>Student Guide to Tourist:</strong> Name, university affiliation, profile biography, languages, interests, and service offerings</li>
                      <li><strong>Contact Information:</strong> Email addresses and phone numbers (if provided) are shared only after both parties agree to connect</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Service Providers and Data Processors</h3>
                    <p className='text-white'>
                      We engage trusted third-party service providers to assist with Platform operations. These processors have access to personal data only as necessary to perform their functions and are contractually obligated to protect your data in accordance with GDPR Article 28:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Cloud Infrastructure:</strong> Vercel (hosting, CDN) – USA (Standard Contractual Clauses)</li>
                      <li><strong>Database Services:</strong> Vercel Postgres – USA (Standard Contractual Clauses)</li>
                      <li><strong>Email Delivery:</strong> Resend – USA (Standard Contractual Clauses)</li>
                      <li><strong>Authentication Services:</strong> NextAuth.js (self-hosted), Google OAuth, Microsoft OAuth – Various (Standard Contractual Clauses where applicable)</li>
                      <li><strong>Analytics:</strong> Google Analytics (if enabled with consent) – USA (Standard Contractual Clauses, anonymized IP addresses)</li>
                      <li><strong>Image CDN:</strong> Unsplash – USA (publicly available images, no personal data transmitted)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Legal Obligations and Safety</h3>
                    <p className='text-white'>
                      We may disclose personal data when required by law or when we believe in good faith that disclosure is necessary to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Comply with legal obligations, court orders, or lawful requests from government authorities</li>
                      <li>Enforce our Terms of Service and other agreements</li>
                      <li>Investigate potential violations of our policies</li>
                      <li>Protect the rights, property, or safety of TourWiseCo, our users, or the public</li>
                      <li>Detect, prevent, or address fraud, security, or technical issues</li>
                      <li>Respond to emergencies involving danger of death or serious physical injury</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Business Transfers</h3>
                    <p className='text-white'>
                      In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your personal data may be transferred to the successor entity. We will notify you via email and/or a prominent notice on our Platform before your personal data is transferred and becomes subject to a different privacy policy.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.5 With Your Consent</h3>
                    <p className='text-white'>
                      We may share personal data for purposes not described in this Privacy Policy when we obtain your explicit consent to do so.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.6 Aggregated and Anonymized Data</h3>
                    <p className='text-white'>
                      We may share aggregated or anonymized data that cannot reasonably be used to identify you, such as statistical trends, platform metrics, or research findings. This data is not considered personal data under GDPR.
                    </p>
                  </div>
                </section>

                {/* International Transfers */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. International Data Transfers</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      TourWiseCo operates in the European Union and United Kingdom. However, some of our service providers are located in countries outside the European Economic Area (EEA) and the United Kingdom, including the United States.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Safeguards for International Transfers</h3>
                    <p className='text-white'>
                      When we transfer personal data to countries that do not provide an adequate level of data protection as determined by the European Commission or UK authorities, we implement appropriate safeguards in accordance with GDPR Chapter V:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Standard Contractual Clauses (SCCs):</strong> We use the European Commission's approved Standard Contractual Clauses (also known as Model Clauses) for transfers to third countries. These clauses are legally binding commitments between data controllers and processors to protect your personal data.</li>
                      <li><strong>Adequacy Decisions:</strong> Where applicable, we rely on adequacy decisions issued by the European Commission recognizing that certain countries provide adequate data protection (e.g., under the EU-U.S. Data Privacy Framework, if applicable).</li>
                      <li><strong>Supplementary Measures:</strong> In addition to SCCs, we conduct transfer impact assessments and implement supplementary technical and organizational measures, such as encryption in transit and at rest, pseudonymization, and access controls.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Your Rights Regarding International Transfers</h3>
                    <p className='text-white'>
                      You have the right to obtain information about the safeguards we have in place for international transfers. You may request a copy of the relevant safeguard mechanisms by contacting us using the details in Section 14.
                    </p>
                  </div>
                </section>

                {/* Data Retention */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.1 Retention Periods</h3>
                    <table className="min-w-full border border-white/10 text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="border border-white/10 px-4 py-2 text-left font-semibold">Data Category</th>
                          <th className="border border-white/10 px-4 py-2 text-left font-semibold">Retention Period</th>
                          <th className="border border-white/10 px-4 py-2 text-left font-semibold">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Active account data</td>
                          <td className="border border-white/10 px-4 py-2">Duration of account + 30 days</td>
                          <td className="border border-white/10 px-4 py-2">Contract performance, service provision</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Inactive accounts (no login)</td>
                          <td className="border border-white/10 px-4 py-2">3 years</td>
                          <td className="border border-white/10 px-4 py-2">User convenience (account recovery)</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Deleted account data</td>
                          <td className="border border-white/10 px-4 py-2">30 days (soft delete), then permanent deletion</td>
                          <td className="border border-white/10 px-4 py-2">Recovery period, then data minimization</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Booking/match history</td>
                          <td className="border border-white/10 px-4 py-2">6 years after last activity</td>
                          <td className="border border-white/10 px-4 py-2">Legal compliance, dispute resolution</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Communication logs</td>
                          <td className="border border-white/10 px-4 py-2">2 years</td>
                          <td className="border border-white/10 px-4 py-2">Customer support, dispute resolution</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Technical logs (IP addresses, etc.)</td>
                          <td className="border border-white/10 px-4 py-2">90 days</td>
                          <td className="border border-white/10 px-4 py-2">Security, fraud prevention</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Analytics data (anonymized)</td>
                          <td className="border border-white/10 px-4 py-2">26 months</td>
                          <td className="border border-white/10 px-4 py-2">GDPR compliance, business insights</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Legal/compliance records</td>
                          <td className="border border-white/10 px-4 py-2">As required by law (typically 6-10 years)</td>
                          <td className="border border-white/10 px-4 py-2">Legal obligations</td>
                        </tr>
                      </tbody>
                    </table>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2 Retention Criteria</h3>
                    <p className='text-white'>
                      We determine retention periods based on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>The purpose for which the data was collected</li>
                      <li>Legal, regulatory, tax, accounting, or reporting requirements</li>
                      <li>Statute of limitations for legal claims</li>
                      <li>Pending or potential litigation</li>
                      <li>Our legitimate business interests (security, fraud prevention, user safety)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.3 Secure Deletion</h3>
                    <p className='text-white'>
                      When personal data is no longer required, we securely delete or anonymize it using industry-standard methods to prevent recovery or reconstruction. Backups containing deleted data are retained for disaster recovery purposes but are securely overwritten according to our backup rotation schedule (maximum 90 days).
                    </p>
                  </div>
                </section>

                {/* Cookies */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking Technologies</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      We use cookies and similar tracking technologies in accordance with the ePrivacy Directive 2002/58/EC and GDPR.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 What Are Cookies?</h3>
                    <p className='text-white'>
                      Cookies are small text files stored on your device when you visit our Platform. They help us recognize you, remember your preferences, and improve your experience.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Types of Cookies We Use</h3>

                    <p className="font-semibold text-white">Strictly Necessary Cookies (No consent required)</p>
                    <p className='text-white'>These cookies are essential for the Platform to function and cannot be disabled:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Authentication cookies:</strong> Keep you logged in and manage your session</li>
                      <li><strong>Security cookies:</strong> Detect and prevent fraudulent activity</li>
                      <li><strong>CSRF tokens:</strong> Protect against cross-site request forgery attacks</li>
                      <li><strong>Load balancing cookies:</strong> Ensure Platform stability and performance</li>
                    </ul>

                    <p className="font-semibold text-white mt-4">Functional Cookies (Consent required)</p>
                    <p className='text-white'>These cookies enhance functionality and personalization:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Preference cookies:</strong> Remember your language, location, and display settings</li>
                      <li><strong>UI state cookies:</strong> Preserve your navigation and form input state</li>
                    </ul>

                    <p className="font-semibold text-white mt-4">Analytics Cookies (Consent required)</p>
                    <p className='text-white'>These cookies help us understand how users interact with the Platform:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Google Analytics:</strong> Tracks page views, user journeys, and engagement metrics</li>
                      <li><strong>Performance monitoring:</strong> Identifies technical issues and slow-loading pages</li>
                    </ul>
                    <p className='text-white'>
                      Analytics cookies are only placed with your explicit consent. IP addresses are anonymized. You can withdraw consent at any time through our cookie preference center.
                    </p>

                    <p className="font-semibold text-white mt-4">Marketing Cookies (Consent required)</p>
                    <p className='text-white'>We do NOT currently use marketing or advertising cookies. Should this change in the future, we will obtain your explicit consent before placing such cookies.</p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.3 Third-Party Cookies</h3>
                    <p className='text-white'>
                      When you use OAuth authentication (Google, Microsoft), these providers may set their own cookies subject to their privacy policies:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Google OAuth: <a href="https://policies.google.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
                      <li>Microsoft OAuth: <a href="https://privacy.microsoft.com/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://privacy.microsoft.com/</a></li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.4 Managing Cookies</h3>
                    <p className='text-white'>
                      You can control cookies through:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Cookie Preference Center:</strong> Accessible through the banner displayed on your first visit or through Platform settings</li>
                      <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies. Instructions vary by browser:
                        <ul className="list-circle pl-6 mt-2 space-y-1">
                          <li>Chrome: Settings → Privacy and security → Cookies</li>
                          <li>Firefox: Options → Privacy & Security → Cookies</li>
                          <li>Safari: Preferences → Privacy → Cookies</li>
                          <li>Edge: Settings → Privacy, search, and services → Cookies</li>
                        </ul>
                      </li>
                    </ul>
                    <p className='text-white'>
                      Blocking strictly necessary cookies will prevent you from using certain essential features of the Platform.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.5 Other Tracking Technologies</h3>
                    <p className='text-white'>
                      In addition to cookies, we may use:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Local storage:</strong> Stores data locally on your device to improve performance</li>
                      <li><strong>Session storage:</strong> Temporary storage that expires when you close your browser</li>
                      <li><strong>Pixels and web beacons:</strong> May be used in emails to track delivery and open rates (with consent)</li>
                    </ul>
                  </div>
                </section>

                {/* Your Rights */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">10. Your Data Protection Rights</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed text-white">
                    <p className='text-white'>
                      Under the GDPR and UK GDPR, you have the following data protection rights. To exercise any of these rights, please contact us using the information in Section 14.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.1 Right of Access (Article 15)</h3>
                    <p className='text-white'>
                      You have the right to request a copy of the personal data we hold about you. We will provide:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Confirmation of whether we process your personal data</li>
                      <li>A copy of your personal data in a commonly used electronic format</li>
                      <li>Information about the purposes of processing, categories of data, recipients, retention periods, and your rights</li>
                    </ul>
                    <p className='text-white'>
                      We will respond within one month of your request. The first copy is provided free of charge; additional copies may incur a reasonable administrative fee.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 Right to Rectification (Article 16)</h3>
                    <p className='text-white'>
                      You have the right to request correction of inaccurate or incomplete personal data. You can update most information directly through your account settings. For data you cannot modify yourself, contact us, and we will update it promptly.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.3 Right to Erasure / "Right to be Forgotten" (Article 17)</h3>
                    <p className='text-white'>
                      You have the right to request deletion of your personal data in certain circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>The data is no longer necessary for the purposes for which it was collected</li>
                      <li>You withdraw consent (where processing is based on consent)</li>
                      <li>You object to processing and there are no overriding legitimate grounds</li>
                      <li>The data was unlawfully processed</li>
                      <li>Deletion is required to comply with a legal obligation</li>
                    </ul>
                    <p className='text-white'>
                      This right is not absolute. We may retain data where necessary to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Comply with legal obligations</li>
                      <li>Establish, exercise, or defend legal claims</li>
                      <li>Protect the rights of other Users or third parties</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.4 Right to Restriction of Processing (Article 18)</h3>
                    <p className='text-white'>
                      You have the right to request that we restrict processing of your personal data in certain situations:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You contest the accuracy of the data (restriction applies during verification)</li>
                      <li>Processing is unlawful, but you prefer restriction over deletion</li>
                      <li>We no longer need the data, but you require it for legal claims</li>
                      <li>You have objected to processing pending verification of our legitimate grounds</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.5 Right to Data Portability (Article 20)</h3>
                    <p className='text-white'>
                      You have the right to receive your personal data in a structured, commonly used, machine-readable format (e.g., JSON or CSV) and to transmit it to another controller. This right applies where:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Processing is based on consent or performance of a contract</li>
                      <li>Processing is carried out by automated means</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.6 Right to Object (Article 21)</h3>
                    <p className='text-white'>
                      You have the right to object to processing based on legitimate interests or for direct marketing purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Legitimate interests:</strong> You may object to processing based on our legitimate interests. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests, rights, and freedoms, or the processing is necessary for legal claims.</li>
                      <li><strong>Direct marketing:</strong> You have an absolute right to object to processing for direct marketing purposes. We will cease such processing immediately upon objection.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.7 Rights Related to Automated Decision-Making (Article 22)</h3>
                    <p className='text-white'>
                      You have the right not to be subject to decisions based solely on automated processing, including profiling, that produce legal effects or similarly significantly affect you.
                    </p>
                    <p className='text-white'>
                      Our matching algorithm uses automated processing to suggest suitable Student Guides based on preferences. However:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>The algorithm provides suggestions only; final decisions are made by human Users</li>
                      <li>You are not obligated to accept suggested matches</li>
                      <li>The algorithm does not make legally binding decisions</li>
                    </ul>
                    <p className='text-white'>
                      If you have concerns about our matching algorithm, you may contact us to request human review and explanation of matching logic.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.8 Right to Withdraw Consent</h3>
                    <p className='text-white'>
                      Where processing is based on consent, you have the right to withdraw consent at any time. Withdrawal does not affect the lawfulness of processing before withdrawal. You can withdraw consent through account settings or by contacting us.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.9 Right to Lodge a Complaint</h3>
                    <p className='text-white'>
                      You have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal data violates data protection law.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>France:</strong> Commission Nationale de l'Informatique et des Libertés (CNIL) – <a href="https://www.cnil.fr/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></li>
                      <li><strong>United Kingdom:</strong> Information Commissioner's Office (ICO) – <a href="https://ico.org.uk/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
                      <li><strong>Other EU Member States:</strong> Contact your local data protection authority</li>
                    </ul>
                    <p className='text-white'>
                      We encourage you to contact us first so we can address your concerns directly.
                    </p>
                  </div>
                </section>

                {/* Data Security */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">11. Data Security</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      We implement appropriate technical and organizational measures to protect personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.1 Technical Measures</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Encryption in transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher (HTTPS)</li>
                      <li><strong>Encryption at rest:</strong> Database and file storage use AES-256 encryption</li>
                      <li><strong>Password security:</strong> Passwords are hashed using bcrypt with salt before storage; plain-text passwords are never stored</li>
                      <li><strong>Access controls:</strong> Role-based access control (RBAC) restricts employee access to personal data on a need-to-know basis</li>
                      <li><strong>Network security:</strong> Firewalls, intrusion detection systems, and DDoS protection</li>
                      <li><strong>Secure authentication:</strong> Multi-factor authentication (MFA) for administrative access</li>
                      <li><strong>Regular security testing:</strong> Vulnerability scanning, penetration testing, and security audits</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.2 Organizational Measures</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Data protection policies and procedures</li>
                      <li>Employee confidentiality agreements</li>
                      <li>Privacy and security training for staff</li>
                      <li>Data breach response plan and incident management procedures</li>
                      <li>Regular review and update of security measures</li>
                      <li>Vendor security assessments and due diligence</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.3 Data Breach Notification</h3>
                    <p className='text-white'>
                      In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Notify the relevant supervisory authority within 72 hours of becoming aware of the breach (as required by GDPR Article 33)</li>
                      <li>Notify affected individuals without undue delay if the breach is likely to result in a high risk to their rights and freedoms (GDPR Article 34)</li>
                      <li>Provide clear information about the nature of the breach, likely consequences, and measures taken to address it</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.4 Limitations</h3>
                    <p className='text-white'>
                      While we implement robust security measures, no system is completely secure. You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Keeping your account credentials confidential</li>
                      <li>Using strong, unique passwords</li>
                      <li>Logging out of shared or public devices</li>
                      <li>Promptly notifying us of any unauthorized access</li>
                    </ul>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">12. Children's Privacy</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children under 18. Users must be at least 18 years old to create an account or use our Services.
                    </p>
                    <p className='text-white'>
                      If we become aware that we have inadvertently collected personal data from a child under 18, we will take immediate steps to delete such data from our systems.
                    </p>
                    <p className='text-white'>
                      If you believe we have collected data from a child under 18, please contact us immediately using the contact information in Section 14.
                    </p>
                  </div>
                </section>

                {/* Changes to Policy */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">13. Changes to This Privacy Policy</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or for other operational, legal, or regulatory reasons.
                    </p>
                    <p className='text-white'>
                      When we make material changes to this Privacy Policy, we will:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Update the "Last Updated" date at the top of this page</li>
                      <li>Notify you via email (to the email address associated with your account)</li>
                      <li>Display a prominent notice on the Platform</li>
                      <li>Where required by law, obtain your consent to the updated Privacy Policy</li>
                    </ul>
                    <p className='text-white'>
                      We encourage you to review this Privacy Policy periodically. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Privacy Policy, unless additional consent is required by law.
                    </p>
                  </div>
                </section>

                {/* Contact Us */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">14. Contact Us</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <p className='text-white'>
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>By contact form:</strong> Available on our Platform (preferred method)</li>
                      <li><strong>Data Protection Officer:</strong> You may contact our Data Protection Officer through the Platform contact form, marking your message "Attn: Data Protection Officer"</li>
                    </ul>
                    <p className="font-semibold mt-4 text-white">
                      TourWiseCo<br />
                      Operating in Paris, France and London, United Kingdom
                    </p>
                    <p className='text-white'>
                      We will respond to all legitimate requests within one month, as required by GDPR Article 12(3). In complex cases, we may extend this period by an additional two months and will inform you of such extension.
                    </p>
                  </div>
                </section>

                {/* Additional Information for EEA/UK Users */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">15. Additional Information for EEA and UK Users</h2>
                  <div className="space-y-4 text-gray-100 leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">15.1 Legal Basis Summary</h3>
                    <p className='text-white'>
                      This section summarizes the legal bases under which we process different categories of personal data:
                    </p>
                    <table className="min-w-full border border-white/10 text-sm mt-4">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="border border-white/10 px-4 py-2 text-left font-semibold">Processing Activity</th>
                          <th className="border border-white/10 px-4 py-2 text-left font-semibold">Legal Basis</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Account creation and management</td>
                          <td className="border border-white/10 px-4 py-2">Performance of contract (Art. 6(1)(b))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Matching algorithm</td>
                          <td className="border border-white/10 px-4 py-2">Performance of contract (Art. 6(1)(b))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Student verification</td>
                          <td className="border border-white/10 px-4 py-2">Performance of contract (Art. 6(1)(b))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Platform messaging</td>
                          <td className="border border-white/10 px-4 py-2">Performance of contract (Art. 6(1)(b))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Security and fraud prevention</td>
                          <td className="border border-white/10 px-4 py-2">Legitimate interests (Art. 6(1)(f))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Platform improvement and analytics</td>
                          <td className="border border-white/10 px-4 py-2">Legitimate interests (Art. 6(1)(f)) / Consent (Art. 6(1)(a))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Customer support</td>
                          <td className="border border-white/10 px-4 py-2">Legitimate interests (Art. 6(1)(f))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Legal compliance</td>
                          <td className="border border-white/10 px-4 py-2">Legal obligation (Art. 6(1)(c))</td>
                        </tr>
                        <tr>
                          <td className="border border-white/10 px-4 py-2">Non-essential cookies</td>
                          <td className="border border-white/10 px-4 py-2">Consent (Art. 6(1)(a))</td>
                        </tr>
                      </tbody>
                    </table>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">15.2 Representative for UK GDPR</h3>
                    <p className='text-white'>
                      TourWiseCo operates in the United Kingdom and is directly subject to UK GDPR. Our London operations serve as the point of contact for UK data protection matters.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">15.3 Cross-Border Data Sharing Within EEA/UK</h3>
                    <p className='text-white'>
                      Data may be transferred between our operations in France and the United Kingdom. Such transfers within the EEA and between the EEA and UK benefit from adequacy protections and do not require additional safeguards.
                    </p>
                  </div>
                </section>

                {/* Acknowledgment */}
                <section className="bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-white mb-3">Acknowledgment</h3>
                  <p className="text-white leading-relaxed">
                    BY USING THE TOURWISECO PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY AND CONSENT TO THE COLLECTION, USE, AND DISCLOSURE OF YOUR PERSONAL DATA AS DESCRIBED HEREIN.
                  </p>
                </section>

              </div>
            </div>
          </div>
        </main>

        <Footer variant="minimal" />
      </div>
    </div>
  )
}
