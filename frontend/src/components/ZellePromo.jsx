// src/components/ZellePromo.jsx
function ZellePromo() {
  return (
    <section className="bg-faint py-10 md:py-12 lg:py-[60px]">
      <div className="container-bank">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left lg:gap-[50px]">
          {/* Content */}
          <div className="w-full md:flex-1">
            <img
              src="/zelle_logo_for_hp.png"
              alt="Zelle"
              className="mx-auto mb-5 block h-auto w-full max-w-[140px] sm:max-w-[160px] md:mx-0 md:max-w-[180px]"
            />

            <ul className="mb-7 list-disc space-y-2 pl-5 text-left">
              <li className="text-sm leading-relaxed text-body sm:text-base lg:text-[1.1rem]">
                Fast, easy way to send and receive money to friends and family
                <sup className="ml-0.5 align-super text-[0.7em]">5</sup>
              </li>
              <li className="text-sm leading-relaxed text-body sm:text-base lg:text-[1.1rem]">
                Send money directly from your account to enrolled recipients in minutes
              </li>
              <li className="text-sm leading-relaxed text-body sm:text-base lg:text-[1.1rem]">
                Send from the convenience of online banking or our mobile app
              </li>
              <li className="text-sm leading-relaxed text-body sm:text-base lg:text-[1.1rem]">
                Your money and information is safe and secure
              </li>
            </ul>
          </div>

          {/* Image */}
          <div className="flex w-full justify-center md:flex-1">
            <img
              src="/zelle_gif.gif"
              alt="Zelle mobile app"
              className="h-auto max-h-[200px] max-w-full object-contain sm:max-h-[280px] md:max-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ZellePromo;