// src/components/AboutUs.jsx
function AboutUs() {
  return (
    <section className="bg-primary-deep py-10 sm:py-12 lg:py-14">
      <div className="container-bank">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12 lg:gap-14">
          {/* Image */}
          <div className="w-full md:flex-1">
            <img
              src="/about_us_image.jpeg"
              alt="About Gulf Coast Trust"
              className="block h-auto w-full"
            />
          </div>

          {/* Content */}
          <div className="w-full md:flex-1">
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              About Us
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-white sm:text-base">
              Gulf Coast Trust offers several personal &amp; business banking services to
              the communities in Baton Rouge, New Orleans, and surrounding Southeast
              Louisiana areas, as well as Florida and Alabama. Banking services include
              checking and savings accounts with online and mobile banking options as
              well as personal loans, home loans, business loans, and trust and
              brokerage services.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-white sm:text-base">
              Our mission is to strengthen our relationship with our customers by
              combining the values of old fashioned community banking that focus on
              individualized customer service with innovative, competitive banking
              products and trust and brokerage services.
            </p>

            <p className="mt-5 font-serif text-lg font-bold text-white sm:text-xl">
              Simply put, we are The Bank That Cares About You!
            </p>

            <a
              href="/about-us/history"
              className="mt-6 inline-flex min-h-[45px] items-center justify-center bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wide text-primary-deep transition-colors hover:bg-[#e8e8e8] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:text-base"
            >
              Our History
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;