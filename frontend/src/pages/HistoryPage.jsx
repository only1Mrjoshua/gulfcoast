// src/pages/HistoryPage.jsx
function HistoryPage() {
  return (
    <div>
      {/* ============================================
          Hero — image only, no text
      ============================================ */}
      <section className="relative min-h-[200px] w-full bg-[url('/history-hero.png')] bg-cover bg-center bg-no-repeat sm:min-h-[280px] md:min-h-[350px]" />

      {/* ============================================
          Content Section
      ============================================ */}
      <div className="bg-canvas py-8 sm:py-10 lg:py-[50px] lg:pb-[60px]">
        <div className="container-bank">
          <div className="mx-auto max-w-[850px]">
            {/* Page header */}
            <h1 className="mb-1.5 font-serif text-2xl font-bold leading-tight text-ink sm:text-3xl md:text-[2.8rem]">
              About Us
            </h1>
            <h2 className="mb-8 font-serif text-lg font-normal leading-snug text-primary sm:text-xl md:text-[1.6rem]">
              Local roots and rich in history
            </h2>

            {/* Welcome block */}
            <h3 className="mb-4 font-serif text-xl font-bold leading-tight text-ink sm:text-2xl md:text-[1.8rem]">
              Welcome to Gulf Coast Bank &amp; Trust Company
            </h3>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              Gulf Coast Bank &amp; Trust Company offers several personal &amp; business
              banking services to the communities in Baton Rouge, New Orleans, and
              surrounding Southeast Louisiana areas. Banking services include checking
              and savings accounts with online and mobile banking options as well as
              personal loans, home loans, business loans, and trust and brokerage
              services.
            </p>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              Our mission is to strengthen our relationship with our customers by
              combining the values of old fashioned community banking that focus on
              individualized customer service with innovative, competitive banking
              products and trust and brokerage services. Simply put, we are{' '}
              <strong className="font-bold text-primary">
                The Bank That Cares About You!
              </strong>
            </p>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              To learn more, phone us at{' '}
              <a
                href="tel:18002232060"
                className="text-primary underline hover:text-primary-dark"
              >
                1-800-223-2060
              </a>
              , email{' '}
              <a
                href="mailto:callcenter@gulfbank.com"
                className="text-primary underline hover:text-primary-dark"
              >
                callcenter@gulfbank.com
              </a>
              , or fill out our banker&rsquo;s appointment request today.
            </p>

            {/* Divider */}
            <hr className="my-8 border-0 border-t-2 border-hairline sm:my-9" />

            {/* History block */}
            <h3 className="mb-4 font-serif text-xl font-bold leading-tight text-ink sm:text-2xl md:text-[1.8rem]">
              History
            </h3>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              In 1883, when Gulf Coast Bank was originally founded as American Savings,
              banking and life itself were much simpler. Machines didn&rsquo;t dominate
              every walk of life, and banking was a matter of people talking to people
              &ndash; and building the trust it takes to do business with each other.
            </p>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              In 1990, a group of local investors led by Bank Chairman and CEO Guy T.
              Williams took over American Savings. They shared a vision of building a
              bank that adhered to the old principles of customer service, yet backed
              them with the most powerful of today&rsquo;s banking technologies. The
              result is a true community bank, able to provide individuals and
              businesses with the strength and resources they need to succeed &ndash; and
              able to recognize each of them individually when they walk through the
              front door of their local Gulf Coast Bank office.
            </p>

            <p className="mb-4.5 text-sm leading-relaxed text-body sm:text-base md:text-[1.05rem]">
              Gulf Coast&rsquo;s philosophy remains people-oriented. We help our
              customers get what they want, one on one. Banking today is more
              complicated, but that doesn&rsquo;t mean it has to be an ordeal. We work
              with our customers individually to match our services to their needs. We
              make banking easy and secure for our customers by providing straight talk
              instead of the old run-around. This is the secret of our continued
              success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;