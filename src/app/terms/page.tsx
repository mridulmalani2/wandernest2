'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
                Terms of Service
              </h1>
              <p className="text-lg text-white">
                Last Updated: November 29, 2025
              </p>
            </div>

            {/* Terms Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="glass-card-dark rounded-xl shadow-premium border border-white/10 p-8 md:p-12 space-y-8">

                {/* Section 1 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. Introduction and Acceptance of Terms</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      Welcome to TourWiseCo ("Platform," "we," "us," or "our"). These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and TourWiseCo, governing your access to and use of our marketplace platform, website, mobile applications, and related services (collectively, the "Services").
                    </p>
                    <p className="text-white">
                      By accessing, browsing, or using the TourWiseCo Platform in any manner, including but not limited to creating an account, booking services, offering services as a student guide, or communicating through our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and all applicable laws and regulations.
                    </p>
                    <p className="text-white">
                      <strong>If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Platform and all related Services.</strong>
                    </p>
                    <p className="text-white">
                      We reserve the right to modify, amend, or update these Terms at any time, at our sole discretion. Any changes will be effective immediately upon posting to the Platform. Your continued use of the Services following the posting of revised Terms constitutes your acceptance of such changes. We encourage you to review these Terms periodically.
                    </p>
                  </div>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Nature of the Platform and Services</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Marketplace Connector Model</h3>
                    <p className="text-white">
                      TourWiseCo operates exclusively as a two-sided marketplace platform that facilitates connections between tourists seeking local experiences ("Tourists") and university students offering guide services ("Student Guides" or "Guides"). We provide the technological infrastructure and communication tools to enable these connections.
                    </p>
                    <p className="text-white">
                      <strong>IMPORTANT: TourWiseCo is NOT a travel agency, tour operator, employment agency, or service provider.</strong> We do not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Employ, supervise, direct, or control Student Guides in any manner</li>
                      <li>Process, handle, or facilitate payments between Tourists and Student Guides</li>
                      <li>Organize, arrange, or provide travel services, tours, or experiences</li>
                      <li>Guarantee the quality, safety, legality, or suitability of any services offered by Student Guides</li>
                      <li>Verify or validate the accuracy of information provided by Users beyond basic identity verification</li>
                      <li>Act as an agent, representative, or partner of any User</li>
                      <li>Assume any liability for interactions, agreements, or transactions between Tourists and Student Guides</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Independent Contractor Relationship</h3>
                    <p className="text-white">
                      Student Guides are independent service providers, NOT employees, agents, partners, or representatives of TourWiseCo. Student Guides:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Set their own rates, schedules, and service offerings independently</li>
                      <li>Determine their own methods of performing services</li>
                      <li>Are solely responsible for their own tax obligations, insurance, licenses, and legal compliance</li>
                      <li>Operate their own independent businesses and assume all associated risks</li>
                      <li>Are not entitled to any employment benefits, minimum wage, overtime, workers' compensation, or other statutory protections</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Platform Services Provided</h3>
                    <p className="text-white">
                      TourWiseCo's role is strictly limited to providing:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>A digital marketplace platform for listing and discovering guide services</li>
                      <li>Basic profile verification for Student Guides (student ID validation)</li>
                      <li>Communication tools to facilitate initial contact between Tourists and Student Guides</li>
                      <li>An algorithmic matching system based on user preferences</li>
                      <li>Informational resources and safety guidelines (advisory only)</li>
                    </ul>
                    <p className="text-white">
                      All bookings, arrangements, service agreements, and payment transactions occur directly and exclusively between Tourists and Student Guides, outside of and independent from the TourWiseCo Platform.
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. User Eligibility and Account Registration</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Age and Legal Capacity</h3>
                    <p className="text-white">
                      To use the Platform, you must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Be at least 18 years of age</li>
                      <li>Possess the legal capacity to enter into binding contracts under the laws of your jurisdiction</li>
                      <li>Not be prohibited from using the Services under any applicable laws or regulations</li>
                      <li>Not have been previously suspended or banned from the Platform</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Student Guide Additional Requirements</h3>
                    <p className="text-white">
                      To register as a Student Guide, you must additionally:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Be currently enrolled as a student at a recognized university in Paris, London, or other supported cities</li>
                      <li>Provide valid student identification and university enrollment verification</li>
                      <li>Possess legal authorization to work or provide services in your jurisdiction</li>
                      <li>Comply with all applicable tax, business registration, and licensing requirements</li>
                      <li>Maintain valid university student status throughout your active use of the Platform</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Account Security and Responsibility</h3>
                    <p className="text-white">
                      You are solely responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Maintaining the confidentiality of your account credentials</li>
                      <li>All activities that occur under your account, whether authorized or unauthorized</li>
                      <li>Immediately notifying us of any unauthorized access or security breach</li>
                      <li>Ensuring that all information provided in your profile is accurate, current, and complete</li>
                    </ul>
                    <p className="text-white">
                      You may not transfer, sell, or share your account with any third party. We reserve the right to suspend or terminate accounts that we reasonably believe have been compromised or are being used in violation of these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Verification Process</h3>
                    <p className="text-white">
                      For Student Guides, TourWiseCo performs basic student identity verification by validating university-issued student identification. This verification:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Confirms only that the individual is enrolled at the stated university</li>
                      <li>Does NOT constitute a background check, criminal record check, or qualification assessment</li>
                      <li>Does NOT verify skills, experience, reliability, safety, or fitness to provide services</li>
                      <li>Does NOT represent any endorsement, recommendation, or guarantee by TourWiseCo</li>
                    </ul>
                    <p className="text-white">
                      Tourists are strongly encouraged to conduct their own independent due diligence before engaging any Student Guide.
                    </p>
                  </div>
                </section>

                {/* Section 4 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct and Prohibited Activities</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      By using the Platform, you agree not to engage in any of the following prohibited activities:
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 General Prohibitions</h3>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Violating any applicable local, national, or international law or regulation</li>
                      <li>Infringing upon the intellectual property rights, privacy rights, or other rights of any party</li>
                      <li>Transmitting any harmful, offensive, defamatory, or unlawful content</li>
                      <li>Harassing, threatening, intimidating, or discriminating against any User</li>
                      <li>Impersonating any person or entity or falsely stating or misrepresenting your affiliation</li>
                      <li>Interfering with or disrupting the Platform or servers or networks connected to the Platform</li>
                      <li>Using automated systems (bots, scrapers, etc.) to access the Platform without our express written permission</li>
                      <li>Attempting to gain unauthorized access to any portion of the Platform or any other systems or networks</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Specific Prohibitions for Student Guides</h3>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Providing services while not enrolled as a university student</li>
                      <li>Offering services that violate university policies or local regulations</li>
                      <li>Making false or misleading representations about qualifications, experience, or services</li>
                      <li>Engaging in any fraudulent, deceptive, or dishonest practices</li>
                      <li>Soliciting direct payment outside the agreed-upon terms with the Tourist</li>
                      <li>Providing services under the influence of drugs or alcohol</li>
                      <li>Engaging in any inappropriate, unprofessional, or unsafe behavior toward Tourists</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Specific Prohibitions for Tourists</h3>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Requesting services that are illegal, unsafe, or violate these Terms</li>
                      <li>Making false bookings or providing inaccurate information</li>
                      <li>Engaging in any inappropriate, harassing, or abusive behavior toward Student Guides</li>
                      <li>Attempting to recruit Student Guides for employment or other non-platform services</li>
                      <li>Failing to honor agreed-upon payment terms with Student Guides</li>
                    </ul>
                  </div>
                </section>

                {/* Section 5 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Booking, Payments, and Transactions</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Direct Transactions</h3>
                    <p className="text-white">
                      <strong>ALL financial transactions, including pricing negotiation, payment terms, payment methods, and payment processing, occur directly and exclusively between Tourists and Student Guides.</strong>
                    </p>
                    <p className="text-white">
                      TourWiseCo:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Does NOT process, handle, or facilitate any payments</li>
                      <li>Does NOT charge booking fees, service fees, or commissions</li>
                      <li>Does NOT set, recommend, or control pricing</li>
                      <li>Does NOT act as a payment intermediary, escrow service, or financial institution</li>
                      <li>Is NOT responsible for any payment disputes, chargebacks, or refunds</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Pricing and Payment Terms</h3>
                    <p className="text-white">
                      Student Guides set their own rates and payment terms independently. Tourists and Student Guides are solely responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Negotiating and agreeing upon pricing, payment methods, and payment schedules</li>
                      <li>Completing all payment transactions directly between each other</li>
                      <li>Resolving any payment disputes or issues that may arise</li>
                      <li>Complying with all applicable tax laws and reporting requirements</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Cancellations and Refunds</h3>
                    <p className="text-white">
                      Cancellation policies and refund terms are determined solely by the agreement between the Tourist and Student Guide. TourWiseCo has no involvement in cancellation or refund decisions and assumes no responsibility for any cancellation disputes.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.4 Tax Obligations</h3>
                    <p className="text-white">
                      Users are solely responsible for determining and fulfilling all applicable tax obligations arising from transactions conducted through the Platform, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Income tax reporting and payment (for Student Guides)</li>
                      <li>Value-added tax (VAT) or goods and services tax (GST) compliance</li>
                      <li>Business registration and licensing requirements</li>
                      <li>Self-employment tax obligations</li>
                    </ul>
                    <p className="text-white">
                      TourWiseCo does not provide tax advice and recommends consulting with qualified tax professionals.
                    </p>
                  </div>
                </section>

                {/* Section 6 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers and Limitation of Liability</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 No Warranties</h3>
                    <p className="text-white">
                      THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY.
                    </p>
                    <p className="text-white">
                      TO THE FULLEST EXTENT PERMITTED BY LAW, TOURWISECO EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
                      <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT OR INFORMATION</li>
                      <li>WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
                      <li>WARRANTIES REGARDING THE QUALITY, SAFETY, OR LEGALITY OF SERVICES PROVIDED BY STUDENT GUIDES</li>
                      <li>WARRANTIES REGARDING THE CONDUCT, IDENTITY, OR QUALIFICATIONS OF ANY USER</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Limitation of Liability</h3>
                    <p className="text-white">
                      TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TOURWISECO, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES</li>
                      <li>LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
                      <li>PERSONAL INJURY, PROPERTY DAMAGE, OR DEATH ARISING FROM USE OF THE PLATFORM OR SERVICES</li>
                      <li>DAMAGES ARISING FROM INTERACTIONS BETWEEN TOURISTS AND STUDENT GUIDES</li>
                      <li>DAMAGES ARISING FROM PAYMENT DISPUTES, FRAUD, OR FINANCIAL LOSSES</li>
                      <li>DAMAGES ARISING FROM THE CONDUCT, ACTIONS, OR OMISSIONS OF ANY USER</li>
                      <li>DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
                      <li>DAMAGES ARISING FROM THIRD-PARTY SERVICES OR CONTENT</li>
                    </ul>
                    <p className="text-white">
                      THESE LIMITATIONS APPLY WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER BASIS, EVEN IF TOURWISECO HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                    </p>
                    <p className="text-white">
                      IN JURISDICTIONS THAT DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW. IN NO EVENT SHALL TOURWISECO'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED FIFTY EUROS (€50).
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 User Responsibility</h3>
                    <p className="text-white">
                      You acknowledge and agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>You use the Platform and engage with other Users entirely at your own risk</li>
                      <li>You are solely responsible for conducting due diligence before engaging any Student Guide</li>
                      <li>You are solely responsible for your personal safety and the safety of your property</li>
                      <li>TourWiseCo has no obligation to verify the identity, qualifications, or background of Users</li>
                      <li>TourWiseCo does not endorse, recommend, or guarantee any User or services</li>
                    </ul>
                  </div>
                </section>

                {/* Section 7 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. Indemnification</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      You agree to indemnify, defend, and hold harmless TourWiseCo, its affiliates, and their respective officers, directors, employees, agents, licensors, and service providers from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from or relating to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Your use of or inability to use the Platform or Services</li>
                      <li>Your violation of these Terms or any applicable law or regulation</li>
                      <li>Your violation of any rights of another User or third party</li>
                      <li>Any content or information you submit, post, or transmit through the Platform</li>
                      <li>Any interactions, agreements, or transactions with other Users</li>
                      <li>Any services you provide or receive through the Platform</li>
                      <li>Any tax obligations or employment-related claims arising from your use of the Platform</li>
                      <li>Your negligence, willful misconduct, or fraud</li>
                    </ul>
                    <p className="text-white">
                      This indemnification obligation shall survive the termination of these Terms and your use of the Platform.
                    </p>
                  </div>
                </section>

                {/* Section 8 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property Rights</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.1 Platform Ownership</h3>
                    <p className="text-white">
                      The Platform, including all software, text, graphics, logos, images, audio, video, data compilations, and other materials ("Platform Content"), is owned by TourWiseCo or its licensors and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2 Limited License</h3>
                    <p className="text-white">
                      Subject to your compliance with these Terms, TourWiseCo grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Platform for your personal, non-commercial use. This license does not include any right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any Platform Content</li>
                      <li>Use any data mining, robots, scraping, or similar data gathering or extraction methods</li>
                      <li>Reverse engineer, decompile, or disassemble any portion of the Platform</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.3 User Content License</h3>
                    <p className="text-white">
                      By submitting, posting, or displaying content on the Platform ("User Content"), you grant TourWiseCo a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content in connection with operating and promoting the Platform.
                    </p>
                  </div>
                </section>

                {/* Section 9 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">9. Termination and Suspension</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      TourWiseCo reserves the right, in its sole discretion, to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason or no reason</li>
                      <li>Remove or disable any User Content at any time</li>
                      <li>Refuse service to anyone for any reason</li>
                    </ul>
                    <p className="text-white">
                      Grounds for immediate termination include, but are not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-white">
                      <li>Violation of these Terms or any applicable law</li>
                      <li>Fraudulent, abusive, or illegal activity</li>
                      <li>Conduct that harms or may harm TourWiseCo, other Users, or third parties</li>
                      <li>Loss of student status (for Student Guides)</li>
                      <li>Providing false or misleading information</li>
                    </ul>
                    <p className="text-white">
                      Upon termination, all licenses and rights granted to you will immediately cease. Sections of these Terms that by their nature should survive termination shall survive, including but not limited to disclaimers, limitations of liability, indemnification, and dispute resolution provisions.
                    </p>
                  </div>
                </section>

                {/* Section 10 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">10. Data Protection and Privacy</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      Your use of the Platform is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, use, and disclosure of your personal data as described in the Privacy Policy.
                    </p>
                    <p className="text-white">
                      You acknowledge that TourWiseCo processes personal data in accordance with the General Data Protection Regulation (GDPR), UK GDPR, and other applicable data protection laws.
                    </p>
                  </div>
                </section>

                {/* Section 11 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">11. Dispute Resolution and Governing Law</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.1 Governing Law</h3>
                    <p className="text-white">
                      These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.2 Dispute Resolution Between Users</h3>
                    <p className="text-white">
                      TourWiseCo is not a party to any agreements or disputes between Tourists and Student Guides. Users are solely responsible for resolving any disputes arising from their interactions or transactions. We may, at our sole discretion, provide informal mediation assistance, but we have no obligation to do so.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.3 Disputes with TourWiseCo</h3>
                    <p className="text-white">
                      For any dispute with TourWiseCo arising from or relating to these Terms or the Platform, you agree to first attempt to resolve the dispute informally by contacting us. If the dispute cannot be resolved informally within 30 days, the dispute shall be resolved through binding arbitration in accordance with the rules of the Paris International Arbitration Centre, or through the courts of Paris, France, at TourWiseCo's election.
                    </p>
                    <p className="text-white">
                      YOU WAIVE ANY RIGHT TO A JURY TRIAL AND ANY RIGHT TO PARTICIPATE IN A CLASS ACTION OR REPRESENTATIVE PROCEEDING.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.4 EU Online Dispute Resolution</h3>
                    <p className="text-white">
                      If you are a consumer based in the European Union, you may access the European Commission's online dispute resolution platform at: <a href="https://ec.europa.eu/consumers/odr" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
                    </p>
                  </div>
                </section>

                {/* Section 12 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">12. General Provisions</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.1 Entire Agreement</h3>
                    <p className="text-white">
                      These Terms, together with the Privacy Policy and any other policies or guidelines referenced herein, constitute the entire agreement between you and TourWiseCo regarding your use of the Platform and supersede all prior agreements and understandings.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.2 Severability</h3>
                    <p className="text-white">
                      If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.3 Waiver</h3>
                    <p className="text-white">
                      No waiver of any provision of these Terms shall be deemed a further or continuing waiver of such provision or any other provision.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.4 Assignment</h3>
                    <p className="text-white">
                      You may not assign or transfer these Terms or your rights hereunder without TourWiseCo's prior written consent. TourWiseCo may assign or transfer these Terms at any time without restriction.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.5 Force Majeure</h3>
                    <p className="text-white">
                      TourWiseCo shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or fuel or energy shortages.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.6 Third-Party Rights</h3>
                    <p className="text-white">
                      These Terms do not confer any third-party beneficiary rights.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.7 Language</h3>
                    <p className="text-white">
                      These Terms may be provided in multiple languages for convenience. In the event of any conflict between language versions, the English version shall prevail.
                    </p>
                  </div>
                </section>

                {/* Section 13 */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
                  <div className="space-y-4 text-white leading-relaxed">
                    <p className="text-white">
                      For questions, concerns, or notices regarding these Terms, please contact us through the contact form on our Platform.
                    </p>
                    <p className="font-semibold text-white">
                      TourWiseCo<br />
                      Operating in Paris, France and London, United Kingdom
                    </p>
                  </div>
                </section>

                {/* Acknowledgment */}
                <section className="bg-white/5 rounded-lg p-6 border-l-4 border-blue-500 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-3">Acknowledgment</h3>
                  <p className="text-white leading-relaxed">
                    BY USING THE TOURWISECO PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE PLATFORM.
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
