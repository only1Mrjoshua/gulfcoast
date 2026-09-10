// src/pages/ContactsPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CreditCard,
  Calendar,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';

function ContactsPage() {
  const [activeRegion, setActiveRegion] = useState('eastbank');

  const regionData = {
    eastbank: ['Carrollton', 'Lakeview', 'Magazine', 'Main Office', 'Transcontinental', 'Veterans', 'Williams', 'Elmwood'],
    northshore: ['Boston Street', 'Covington', 'Hammond', 'Mandeville - Hwy 22', 'Slidell'],
    westbank: ['Gretna', 'Manhattan', 'Terrytown'],
    batonrouge: ['Old Goodwood', 'Perkins'],
    stbernard: ['Business Center', 'Civic Center'],
    alabama: ['Orange Beach'],
    florida: ['Miramar Beach'],
    mississippi: ['Hattiesburg'],
  };

  const regions = [
    { key: 'eastbank', label: 'Eastbank' },
    { key: 'westbank', label: 'Westbank' },
    { key: 'stbernard', label: 'St. Bernard' },
    { key: 'northshore', label: 'Northshore' },
    { key: 'batonrouge', label: 'Baton Rouge' },
    { key: 'florida', label: 'Florida' },
    { key: 'alabama', label: 'Alabama' },
  ];

  const branchGroups = [
    { label: 'EASTBANK', names: ['Carrollton', 'Lakeview', 'Magazine', 'Main Office', 'Transcontinental', 'Veterans', 'Williams', 'Elmwood'] },
    { label: 'NORTHSHORE', names: ['Boston Street', 'Covington', 'Hammond', 'Mandeville - Hwy 22', 'Slidell'] },
    { label: 'WESTBANK', names: ['Gretna', 'Manhattan', 'Terrytown'] },
    { label: 'BATON ROUGE', names: ['Old Goodwood', 'Perkins'] },
    { label: 'ST. BERNARD', names: ['Business Center', 'Civic Center'] },
    { label: 'ALABAMA', names: ['Orange Beach'] },
    { label: 'FLORIDA', names: ['Miramar Beach'] },
    { label: 'MISSISSIPPI', names: ['Hattiesburg'] },
  ];

  return (
    <div className="bg-canvas">
      {/* ============================================
          SECTION 1: HERO
      ============================================ */}
      <section className="relative min-h-[220px] bg-[url('/contact_us_header.png')] bg-cover bg-center sm:min-h-[250px] md:min-h-[300px]">
        <div className="flex min-h-[220px] items-center bg-gradient-to-r from-black/85 via-black/70 to-black/10 py-8 sm:min-h-[250px] sm:py-10 md:min-h-[300px]">
          <div className="container-bank w-full">
            <div className="max-w-[500px] py-5">
              <h1 className="font-serif text-[26px] font-bold leading-tight text-white sm:text-[32px] md:text-[38px]">
                Contact Us
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-white/90 sm:text-[15px] md:text-base">
                Live Customer Service Chat 7 days a week, 7 a.m.-9 p.m. Click the
                &ldquo;Let&rsquo;s Talk!&rdquo; bubble for online chat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 2: SECURITY WARNING
      ============================================ */}
      <section className="border-b border-hairline bg-white py-4">
        <div className="container-bank">
          <p className="mx-auto max-w-[900px] text-center text-[13px] leading-relaxed text-muted sm:text-sm">
            <strong className="text-[#333333]">
              As a reminder, Gulf Coast Bank employees will NEVER call and ask for
              personal information
            </strong>{' '}
            such as your Social Security number, account numbers, Debit or Credit Card
            information, or Digital Banking Login ID and Password. If you receive a call
            even if it appears to be from us and you are unsure, please hang up and call
            your local banking office.
          </p>
        </div>
      </section>

      {/* ============================================
          SECTION 3: COMMERCIAL LENDERS
      ============================================ */}
      <section className="bg-primary-deep py-10 sm:py-12 lg:py-[50px] lg:pb-[35px]">
        <div className="container-bank">
          <h2 className="mb-7 text-center font-serif text-base font-bold leading-snug tracking-wide text-white sm:text-lg md:text-[22px]">
            We have over 24 Commercial Lenders located throughout Southeast Louisiana,
            Florida, and Alabama.
          </h2>

          {/* Region tabs */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {regions.map(({ key, label }) => {
              const isActive = activeRegion === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveRegion(key)}
                  className={`min-h-[32px] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:min-h-[36px] sm:px-4.5 sm:text-[13px] md:min-h-[40px] md:px-6 md:text-sm ${
                    isActive
                      ? 'bg-white outline outline-2 outline-offset-2 outline-white'
                      : 'bg-white hover:bg-[#e8e8e8]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Locations list */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 py-3">
            {regionData[activeRegion].map((location, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-sm text-white/90 sm:text-base"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: PRIMARY CONTACT CARDS
      ============================================ */}
      <section className="bg-faint py-10 sm:py-12 lg:py-[50px]">
        <div className="container-bank">
          <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {/* Card 1: Locations */}
            <div className="flex flex-col border border-hairline bg-[#f9f9f9] p-5 pt-7 shadow-[0_2px_6px_rgba(0,0,0,0.06)] sm:p-6 sm:pt-8">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-hairline">
                <img
                  src="/uneven_columns.jpeg"
                  alt="Locations"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-3 text-center font-serif text-lg font-bold text-primary-deep sm:text-xl md:text-2xl">
                Locations
              </h3>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                Gulf Coast Bank &amp; Trust Co. has 23 branch locations throughout South
                Louisiana: New Orleans, Jefferson, Northshore, St. Bernard and Baton
                Rouge.
              </p>
              <p className="mb-4 text-center text-xs italic leading-relaxed text-muted sm:text-sm">
                For branch locations, please visit{' '}
                <Link to="/locations" className="text-primary underline hover:text-primary-dark">
                  our locations page
                </Link>
                .
              </p>
              <Link
                to="/locations"
                className="mt-auto inline-flex min-h-[38px] items-center justify-center bg-primary px-6 pb-1.5 pt-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark sm:min-h-[45px] sm:text-sm"
              >
                LEARN MORE
              </Link>
            </div>

            {/* Card 2: Customer Service */}
            <div className="flex flex-col border border-hairline bg-[#f9f9f9] p-5 pt-7 shadow-[0_2px_6px_rgba(0,0,0,0.06)] sm:p-6 sm:pt-8">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-hairline">
                <img
                  src="/debit_card.jpeg"
                  alt="Customer Service"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-3 text-center font-serif text-lg font-bold text-primary-deep sm:text-xl md:text-2xl">
                Customer Service
              </h3>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                <strong className="text-[#333333]">7 days a week, 7am-9pm</strong>
                <br />
                <a href="tel:18002232060" className="text-primary hover:underline">
                  1-800-223-2060
                </a>
                <br />
                <a href="tel:15045616124" className="text-primary hover:underline">
                  504-561-6124
                </a>
              </p>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                <strong className="text-[#333333]">Live Customer Service Chat</strong>
                <br />
                7 days a week, 9am-9pm
                <br />
                Click the &ldquo;Let&rsquo;s Talk!&rdquo; bubble
                <br />
                or fill out an{' '}
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  online contact form
                </a>
                .
              </p>
              <a
                href="#"
                className="mt-auto inline-flex min-h-[38px] items-center justify-center bg-primary px-6 pb-1.5 pt-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark sm:min-h-[45px] sm:text-sm"
              >
                LEARN MORE
              </a>
            </div>

            {/* Card 3: Digital Banking Support */}
            <div className="flex flex-col border border-hairline bg-[#f9f9f9] p-5 pt-7 shadow-[0_2px_6px_rgba(0,0,0,0.06)] sm:p-6 sm:pt-8">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-hairline">
                <img
                  src="/card_solutions.jpeg"
                  alt="Card Solutions"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-3 text-center font-serif text-lg font-bold text-primary-deep sm:text-xl md:text-2xl">
                Digital Banking Support
              </h3>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                <strong className="text-[#333333]">Monday-Friday 8:30 am-5pm</strong>
                <br />
                <a href="tel:15045445574" className="text-primary hover:underline">
                  504-544-5574
                </a>
                <br />
                <a href="tel:18002232060" className="text-primary hover:underline">
                  1-800-223-2060
                </a>
              </p>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                <strong className="text-[#333333]">24 Hour Telebanking Service Line</strong>
                <br />
                <a href="tel:15045616123" className="text-primary hover:underline">
                  504-561-6123
                </a>
              </p>
              <p className="mb-2.5 text-center text-sm leading-relaxed text-body sm:text-base">
                Digital Banking unavailable?
                <br />
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  Click here
                </a>{' '}
                for additional information.
              </p>
              <a
                href="#"
                className="mt-auto inline-flex min-h-[38px] items-center justify-center bg-primary px-6 pb-1.5 pt-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark sm:min-h-[45px] sm:text-sm"
              >
                LEARN MORE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: BANKER APPOINTMENT CTA
      ============================================ */}
      <section className="bg-primary-deep py-10 text-center">
        <div className="container-bank">
          <p className="mb-4.5 font-serif text-base text-white sm:text-lg md:text-[22px]">
            Set up an appointment with a banker.
          </p>
          <a
            href="#"
            className="inline-flex min-h-[38px] items-center justify-center bg-white px-5 pb-1.5 pt-2.5 text-xs font-bold uppercase tracking-wide text-primary-deep transition-colors hover:bg-[#e8e8e8] sm:min-h-[45px] sm:px-7 sm:text-sm md:px-9 md:text-base"
          >
            BANKERS APPOINTMENT REQUEST
          </a>
        </div>
      </section>

      {/* ============================================
          SECTION 7: DETAILED SUPPORT INFORMATION GRID
      ============================================ */}
      <section className="bg-white py-10 sm:py-12 lg:py-[50px]">
        <div className="container-bank">
          <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
            {/* Row 1 */}
            <div className="border-t border-hairline py-5 first:border-t-0 md:[&:nth-child(1)]:border-t-0 md:[&:nth-child(2)]:border-t-0 lg:[&:nth-child(1)]:border-t-0 lg:[&:nth-child(2)]:border-t-0 lg:[&:nth-child(3)]:border-t-0">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Travel Information
              </h4>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                Please notify Customer Service Department at{' '}
                <a href="tel:18002232060" className="text-primary hover:underline">
                  1-800-223-2060
                </a>{' '}
                so that you can conveniently &amp; securely use your Debit Card. You can
                also email us at{' '}
                <a
                  href="mailto:callcenter@gulfbank.com"
                  className="text-primary underline hover:text-primary-dark"
                >
                  callcenter@gulfbank.com
                </a>
                .
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(2)]:border-t-0 lg:[&:nth-child(2)]:border-t-0">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Card Services
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Debit Card Activation, PIN Selection and Reset
                </strong>
                <br />
                <a href="tel:18009923808" className="text-primary hover:underline">
                  1-800-992-3808
                </a>
                <br />
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  Activation Instructions
                </a>
              </p>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Debit, Credit Card Services
                </strong>
                <br />
                <a href="tel:15045654640" className="text-primary hover:underline">
                  504-565-4640
                </a>
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(3)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Calendar
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                Complete list of Gulf Coast Bank&rsquo;s bank holidays:
                <br />
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  2026 Gulf Coast Bank holiday calendar
                </a>{' '}
                and the PDF version.
              </p>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  2026 Holiday Processing Schedule
                </a>
              </p>
            </div>

            {/* Row 2 */}
            <div className="border-t border-hairline py-5 md:[&:nth-child(4)]:border-t md:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(4)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Support By Email
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  Secure Email Sign Up
                </a>
                <br />
                <a href="#" className="text-primary underline hover:text-primary-dark">
                  Log In
                </a>
              </p>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Customer Service</strong>
                <br />
                <strong className="text-[#333333]">Business Solutions</strong>
                <br />
                <strong className="text-[#333333]">Tuition Lending</strong>
                <br />
                <strong className="text-[#333333]">SBA Lending</strong>
                <br />
                <strong className="text-[#333333]">Wealth Management</strong>
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(5)]:border-t lg:[&:nth-child(5)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Lost Cards
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Lost and Stolen Cards After Hours
                </strong>
                <br />
                <a href="tel:18005548969" className="text-primary hover:underline">
                  1-800-554-8969
                </a>
              </p>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Card Lost Internationally
                </strong>
                <br />
                <a href="tel:16145645101" className="text-primary hover:underline">
                  614-564-5101
                </a>{' '}
                <span className="text-xs italic text-[#999999] sm:text-sm">
                  (International rates apply)
                </span>
              </p>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Lost or Stolen MasterCard Credit Card
                </strong>
                <br />
                <a href="tel:18552050965" className="text-primary hover:underline">
                  1-855-205-0965
                </a>
              </p>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">
                  Card Lost Internationally
                </strong>
                <br />
                <a href="tel:13012879918" className="text-primary hover:underline">
                  301-287-9918
                </a>{' '}
                <span className="text-xs italic text-[#999999] sm:text-sm">
                  (International rates apply)
                </span>
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(6)]:border-t lg:[&:nth-child(6)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Telebanking Assistance
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                Access your accounts via phone at any time
              </p>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <a href="tel:15045616123" className="text-primary hover:underline">
                  1-504-561-6123
                </a>
                <br />
                <a href="tel:18669226123" className="text-primary hover:underline">
                  1-866-922-6123
                </a>
              </p>
            </div>

            {/* Row 3 */}
            <div className="border-t border-hairline py-5 md:[&:nth-child(7)]:border-t lg:[&:nth-child(7)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Tuition Loan Customer Support
              </h4>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Numbers</strong>
                <br />
                M-F 8am-4:30pm
                <br />
                <a href="tel:15045446370" className="text-primary hover:underline">
                  504-544-6370
                </a>
                <br />
                <a href="tel:18553352068" className="text-primary hover:underline">
                  1-855-335-2068
                </a>
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(8)]:border-t lg:[&:nth-child(8)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Gulf Coast Wealth Management
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Number</strong>
                <br />
                <a href="tel:15045653660" className="text-primary hover:underline">
                  504-565-3660
                </a>
              </p>

              <h4 className="mb-1.5 mt-4 font-serif text-sm font-bold text-[#F2672A] sm:text-base md:text-[17px]">
                Trust Services
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Number</strong>
                <br />
                <a href="tel:15048412850" className="text-primary hover:underline">
                  504-841-2850
                </a>
              </p>

              <h4 className="mb-1.5 mt-4 font-serif text-sm font-bold text-[#F2672A] sm:text-base md:text-[17px]">
                Mortgage Services
              </h4>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Number</strong>
                <br />
                <a href="tel:18335784663" className="text-primary hover:underline">
                  833-578-4663
                </a>
              </p>
            </div>

            <div className="border-t border-hairline py-5 md:[&:nth-child(9)]:border-t lg:[&:nth-child(9)]:border-t">
              <h4 className="mb-3 font-serif text-base font-bold text-[#F2672A] sm:text-[17px] md:text-xl">
                Business Solutions
              </h4>
              <p className="mb-2 text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Numbers</strong>
                <br />
                <a href="tel:15045446380" className="text-primary hover:underline">
                  504-544-6380
                </a>
                <br />
                <a href="tel:18667553887" className="text-primary hover:underline">
                  1-866-755-3887
                </a>
              </p>

              <h4 className="mb-1.5 mt-4 font-serif text-sm font-bold text-[#F2672A] sm:text-base md:text-[17px]">
                Business Credit
              </h4>
              <p className="text-sm leading-relaxed text-body sm:text-[15px] md:text-base">
                <strong className="text-[#333333]">Support Numbers</strong>
                <br />
                <a href="tel:19852497200" className="text-primary hover:underline">
                  985-249-7200
                </a>
                <br />
                <a href="tel:18665778867" className="text-primary hover:underline">
                  1-866-577-8867
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 8: BRANCH LOCATIONS
      ============================================ */}
      <section className="bg-faint py-10 sm:py-12 lg:py-[50px] lg:pb-[60px]">
        <div className="container-bank">
          <h3 className="mb-7 text-center font-serif text-lg font-bold uppercase tracking-wide text-primary-deep sm:text-xl md:text-2xl">
            BRANCH LOCATIONS
          </h3>

          <div className="mx-auto max-w-[1000px]">
            {branchGroups.map((group) => (
              <div
                key={group.label}
                className="flex flex-col border-b border-hairline py-3.5 last:border-b-0 md:flex-row md:items-start md:py-3"
              >
                <div className="mb-1.5 shrink-0 text-xs font-bold uppercase tracking-wide text-[#F2672A] sm:text-sm md:mb-0 md:min-w-[150px] md:pr-5 md:text-[15px]">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 md:gap-x-5">
                  {group.names.map((name, idx) => (
                    <span
                      key={idx}
                      className="cursor-pointer text-sm text-body hover:text-primary hover:underline sm:text-[15px] md:text-base"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactsPage;