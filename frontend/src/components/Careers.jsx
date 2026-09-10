// src/components/Careers.jsx
function Careers() {
  return (
    <section className="bg-white py-8 sm:py-10 lg:py-[50px]">
      <div className="container-bank">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12 lg:gap-[50px]">
          {/* Content */}
          <div className="w-full md:flex-1">
            <h2 className="font-serif text-2xl font-bold text-primary-deep sm:text-3xl lg:text-[2.4rem]">
              Careers
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base lg:text-[1.05rem]">
              Looking for a rewarding career with a stable and well-respected financial
              institution? We are a dynamic and growing bank committed to the customers
              and communities we serve.
            </p>

            <p className="mt-3.5 text-sm leading-relaxed text-muted sm:text-base lg:text-[1.05rem]">
              Gulf Coast Trust is growing and we are looking for energetic employees who
              share our passion for serving our customers and our communities.
            </p>

            <p className="mt-3.5 text-sm leading-relaxed text-muted sm:text-base lg:text-[1.05rem]">
              We offer challenging work, competitive pay, excellent benefits, and a
              pleasant working environment with opportunities for advancement. We
              welcome your interest in growing your career with us.
            </p>
          </div>

          {/* Image */}
          <div className="w-full md:flex-1">
            <img
              src="/comejoinourteam.png"
              alt="Join our team"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Careers;