// src/components/Locations.jsx
import { Link } from 'react-router-dom';

function Locations() {
  return (
    <section className="flex min-h-[280px] items-center bg-[url('/map.png')] bg-cover bg-center bg-no-repeat py-5 sm:min-h-[350px] sm:py-8 lg:min-h-[450px] lg:py-10">
      <div className="container-bank w-full">
        <div className="ml-auto max-w-full bg-primary-deep px-4 py-5 sm:px-5 sm:py-6 md:max-w-[480px] md:px-10 md:py-9">
          <h2 className="mb-2.5 text-base font-bold uppercase leading-tight tracking-wide text-white sm:text-lg lg:text-[1.6rem]">
            LOCATIONS &amp; ATMS WHERE YOU NEED TO FIND THEM
          </h2>

          <Link
            to="/locations"
            className="inline-flex min-h-[45px] items-center justify-center bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wide text-primary-deep transition-opacity hover:opacity-70 hover:underline sm:px-7 sm:text-sm lg:text-base"
          >
            LIST OF LOCATIONS
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Locations;