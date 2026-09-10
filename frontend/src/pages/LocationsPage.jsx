import { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Building2,
  CreditCard,
  Phone,
  Clock,
  Car,
  Landmark,
  SlidersHorizontal,
} from 'lucide-react';

const locationsData = [
  {
    id: 1,
    name: 'Veterans',
    type: 'Branch',
    address: '1825 Veterans Blvd',
    city: 'Metairie',
    state: 'LA',
    zip: '70005',
    phone: '504-841-2830',
    distance: '0.0',
    services: ['Drive Thru', 'Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 2,
    name: 'Lakeview',
    type: 'Branch',
    address: '848 Harrison Ave',
    city: 'New Orleans',
    state: 'LA',
    zip: '70124',
    phone: '504-539-7300',
    distance: '2.3',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 3,
    name: 'Transcontinental',
    type: 'Branch',
    address: '5001 Veterans Blvd',
    city: 'Metairie',
    state: 'LA',
    zip: '70006',
    phone: '504-539-7310',
    distance: '3.1',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 4,
    name: 'Carrollton',
    type: 'Branch',
    address: '201 N Carrollton Avenue',
    city: 'New Orleans',
    state: 'LA',
    zip: '70119',
    phone: '504-544-6310',
    distance: '3.2',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 5,
    name: 'Elmwood',
    type: 'Branch',
    address: '1208 Elmwood Park Blvd',
    city: 'Harahan',
    state: 'LA',
    zip: '70123',
    phone: '504-841-6050',
    distance: '3.9',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 6,
    name: 'Main Office',
    type: 'Branch',
    address: '200 St Charles Ave',
    city: 'New Orleans',
    state: 'LA',
    zip: '70130',
    phone: '504-561-6100',
    distance: '5.6',
    services: [],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'No Drive Up Available',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 7,
    name: 'Williams',
    type: 'Branch',
    address: '3410 Williams Blvd',
    city: 'Kenner',
    state: 'LA',
    zip: '70065',
    phone: '504-565-3656',
    distance: '5.8',
    services: ['Drive Thru', 'Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 8,
    name: 'New Orleans Baptist Theological Seminary',
    type: 'ATM',
    address: '3939 Gentilly Blvd',
    city: 'New Orleans',
    state: 'LA',
    zip: '70126',
    phone: '',
    distance: '6.1',
    services: [],
    lobbyHours: 'ATM Hours: 24 hours / 7 days a week',
    driveUpHours: '',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 9,
    name: 'Magazine',
    type: 'Branch',
    address: '3200 Magazine St',
    city: 'New Orleans',
    state: 'LA',
    zip: '70115',
    phone: '504-841-6000',
    distance: '6.4',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 10,
    name: 'Gretna',
    type: 'Branch',
    address: '201 Huey P Long Ave',
    city: 'Gretna',
    state: 'LA',
    zip: '70053',
    phone: '504-544-5599',
    distance: '7.6',
    services: ['Drive Thru'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Fri. 9am-4pm',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 11,
    name: 'Manhattan',
    type: 'Branch',
    address: '1901 Manhattan Blvd, Bldg F Suite 100',
    city: 'Harvey',
    state: 'LA',
    zip: '70058',
    phone: '504-544-6350',
    distance: '9.7',
    services: ['Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: '',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 12,
    name: 'Terrytown',
    type: 'Branch',
    address: '737 Terry Parkway',
    city: 'Terrytown',
    state: 'LA',
    zip: '70056',
    phone: '504-561-6110',
    distance: '9.9',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 13,
    name: 'Civic Center',
    type: 'Branch',
    address: '8216 W Judge Perez Dr',
    city: 'Chalmette',
    state: 'LA',
    zip: '70043',
    phone: '504-561-1300',
    distance: '10.2',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 14,
    name: 'Business Center',
    type: 'Branch',
    address: '1801 E Judge Perez Dr',
    city: 'Chalmette',
    state: 'LA',
    zip: '70043',
    phone: '504-569-1900',
    distance: '12.6',
    services: ['Drive Thru', 'Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 15,
    name: 'Lower St. Bernard ATM',
    type: 'ATM',
    address: '907 LA-46',
    city: 'St. Bernard',
    state: 'LA',
    zip: '70085',
    phone: '',
    distance: '18.8',
    services: [],
    lobbyHours: 'ATM - Deposit Cash and Checks | 24 hours / 7 days a week',
    driveUpHours: '',
    atm: 'Community Cash ATM',
  },
  {
    id: 16,
    name: 'Slidell',
    type: 'Branch',
    address: '1900 Oak Harbor Blvd',
    city: 'Slidell',
    state: 'LA',
    zip: '70461',
    phone: '985-646-6500',
    distance: '26.4',
    services: ['Drive Thru', 'Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 17,
    name: 'Mandeville - Hwy 22',
    type: 'Branch',
    address: '4565 LaSalle St',
    city: 'Mandeville',
    state: 'LA',
    zip: '70471',
    phone: '985-249-7240',
    distance: '27.4',
    services: ['Drive Thru', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 18,
    name: 'Covington',
    type: 'Branch',
    address: '1110 N Hwy 190',
    city: 'Covington',
    state: 'LA',
    zip: '70433',
    phone: '985-898-3900',
    distance: '31.0',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm | Sat. 9am-noon',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm | Sat. 9am-noon',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 19,
    name: 'Boston Street',
    type: 'Branch',
    address: '423 E Boston Street',
    city: 'Covington',
    state: 'LA',
    zip: '70433',
    phone: '985-646-6530',
    distance: '32.8',
    services: ['Drive Thru', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Fri. 9am-4pm',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 20,
    name: 'Hammond',
    type: 'Branch',
    address: '300 West Morris Avenue',
    city: 'Hammond',
    state: 'LA',
    zip: '70403',
    phone: '985-249-7272',
    distance: '39.5',
    services: ['Drive Thru'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Fri. 9am-4pm',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 21,
    name: 'Perkins',
    type: 'Branch',
    address: '13906 Perkins Road',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70810',
    phone: '225-763-2000',
    distance: '60.4',
    services: ['Drive Thru', 'Coin Counting'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 22,
    name: 'Old Goodwood',
    type: 'Branch',
    address: '7235 Jefferson Hwy',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70806',
    phone: '225-932-7272',
    distance: '65.2',
    services: ['Drive Thru', 'Coin Counting', 'Safe Deposit Box'],
    lobbyHours: 'Mon.-Fri. 9am-4pm',
    driveUpHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 23,
    name: 'Hattiesburg',
    type: 'Branch',
    address: '3000 Hardy St',
    city: 'Hattiesburg',
    state: 'MS',
    zip: '39401',
    phone: '',
    distance: '103.3',
    services: [],
    lobbyHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-4:30pm',
    driveUpHours: '',
    atm: '',
  },
  {
    id: 24,
    name: 'Gulf Shores',
    type: 'ATM',
    address: '1549 Gulf Shores Pkwy',
    city: 'Gulf Shores',
    state: 'AL',
    zip: '36542',
    phone: '',
    distance: '148.0',
    services: [],
    lobbyHours: 'ATM Hours: 6am - 11pm / 7 days a week',
    driveUpHours: '',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 25,
    name: 'Perdido Beach',
    type: 'ATM',
    address: '25405 Perdido Beach Blvd',
    city: 'Orange Beach',
    state: 'AL',
    zip: '36561',
    phone: '',
    distance: '153.8',
    services: [],
    lobbyHours: 'ATM Hours: 24 hours / 7 days a week',
    driveUpHours: '',
    atm: 'ATM | Community Cash ATM',
  },
  {
    id: 26,
    name: 'Orange Beach',
    type: 'Branch',
    address: '25910 Canal Road, Suite N',
    city: 'Orange Beach',
    state: 'AL',
    zip: '36561',
    phone: '251-262-6500',
    distance: '154.5',
    services: [],
    lobbyHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    driveUpHours: '',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
  {
    id: 27,
    name: 'Miramar Beach',
    type: 'Branch',
    address: '50 S Holiday Rd',
    city: 'Miramar Beach',
    state: 'FL',
    zip: '32550',
    phone: '850-483-6410',
    distance: '226.5',
    services: [],
    lobbyHours: 'Mon.-Thu. 9am-4pm | Fri. 9am-5pm',
    driveUpHours: '',
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM',
  },
];

// Icon for service tag
const getServiceIcon = (service) => {
  const s = service.toLowerCase();
  if (s.includes('drive')) return Car;
  if (s.includes('coin')) return CreditCard;
  if (s.includes('safe') || s.includes('deposit')) return Landmark;
  return Building2;
};

function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('any');
  const [filterDistance, setFilterDistance] = useState('any');
  const [sortBy, setSortBy] = useState('name');
  const [filteredLocations, setFilteredLocations] = useState(locationsData);

  const types = ['any', ...new Set(locationsData.map((loc) => loc.type))];

  useEffect(() => {
    let results = locationsData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(term) ||
          loc.city.toLowerCase().includes(term) ||
          loc.state.toLowerCase().includes(term) ||
          loc.address.toLowerCase().includes(term) ||
          loc.zip.includes(term)
      );
    }

    if (filterType !== 'any') {
      results = results.filter((loc) => loc.type === filterType);
    }

    if (filterDistance !== 'any') {
      const maxDist = parseFloat(filterDistance);
      results = results.filter((loc) => {
        const dist = parseFloat(loc.distance);
        return !isNaN(dist) && dist <= maxDist;
      });
    }

    results = [...results].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return a.city.localeCompare(b.city);
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return 0;
    });

    setFilteredLocations(results);
  }, [searchTerm, filterType, filterDistance, sortBy]);

  return (
    <div className="bg-canvas">
      {/* Map Section */}
      <div className="h-[240px] w-full overflow-hidden bg-[#313538] sm:h-[300px] lg:h-[400px]">
        <img
          src="/map.png"
          alt="Map of locations"
          className="h-full w-full object-cover"
        />
      </div>

      {/* List Section */}
      <div className="container-bank py-10 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 border-b border-hairline pb-6">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
            <h1 className="font-serif text-3xl font-bold leading-tight text-deep-accent sm:text-4xl">
              Locations
            </h1>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body sm:text-base">
            With {locationsData.length} locations, Gulf Coast Bank &amp; Trust serves
            Baton Rouge, New Orleans Metro Area, Florida, Alabama, and Mississippi.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-stretch">
          {/* Search */}
          <div className="flex min-h-[48px] w-full min-w-0 flex-1 items-stretch border border-hairline bg-white focus-within:border-primary">
            <div className="flex flex-1 items-center">
              <Search
                className="ml-4 h-4 w-4 shrink-0 text-muted"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search by city, address, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-full w-full border-none bg-transparent px-3 py-3 text-sm text-body outline-none placeholder:text-muted/70"
              />
            </div>
            <button
              type="button"
              aria-label="Search"
              className="flex w-12 shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Search className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="min-h-[48px] border border-hairline bg-white px-4 py-2 text-sm text-body focus:border-primary focus:outline-none"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'any' ? 'All Types' : type}
                </option>
              ))}
            </select>

            <select
              value={filterDistance}
              onChange={(e) => setFilterDistance(e.target.value)}
              className="min-h-[48px] border border-hairline bg-white px-4 py-2 text-sm text-body focus:border-primary focus:outline-none"
            >
              <option value="any">Any Distance</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
              <option value="20">Within 20 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="mb-6 flex flex-col gap-3 border-b border-hairline py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <SlidersHorizontal
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={1.75}
            />
            {filteredLocations.length} location
            {filteredLocations.length === 1 ? '' : 's'} found
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted">
              Sort by:
            </span>
            {[
              { key: 'name', label: 'Name' },
              { key: 'city', label: 'City' },
              { key: 'distance', label: 'Distance' },
            ].map(({ key, label }) => {
              const active = sortBy === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortBy(key)}
                  className={`min-h-[30px] border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-hairline bg-white text-body hover:border-primary hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location List */}
        <div className="flex flex-col gap-4">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => {
              const isATM = location.type === 'ATM';
              return (
                <div
                  key={location.id}
                  className="border border-hairline bg-white p-5 transition-colors hover:bg-faint sm:p-6"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                      {location.name}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                        isATM ? 'bg-[#b8860b]' : 'bg-primary'
                      }`}
                    >
                      {isATM ? (
                        <CreditCard className="h-3 w-3" strokeWidth={2.25} />
                      ) : (
                        <Building2 className="h-3 w-3" strokeWidth={2.25} />
                      )}
                      {location.type}
                    </span>

                    <span className="inline-flex items-center gap-1 border border-hairline bg-faint px-2.5 py-0.5 text-xs font-medium text-muted">
                      <MapPin className="h-3 w-3" strokeWidth={2} />
                      {location.distance} miles
                    </span>
                  </div>

                  {/* Body */}
                  <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-body md:grid-cols-2">
                    {/* Left column: address, phone, hours */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={1.75}
                        />
                        <div>
                          <p className="text-sm text-body">{location.address}</p>
                          <p className="text-sm text-body">
                            {location.city}, {location.state} {location.zip}
                          </p>
                        </div>
                      </div>

                      {location.phone && (
                        <div className="flex items-center gap-2">
                          <Phone
                            className="h-3.5 w-3.5 shrink-0 text-primary"
                            strokeWidth={1.75}
                          />
                          <a
                            href={`tel:${location.phone.replace(/[^0-9]/g, '')}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {location.phone}
                          </a>
                        </div>
                      )}

                      {location.lobbyHours && (
                        <div className="flex items-start gap-2">
                          <Clock
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                            strokeWidth={1.75}
                          />
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-deep-accent">
                              {isATM ? 'ATM Hours' : 'Lobby Hours'}
                            </div>
                            <p className="text-xs text-body sm:text-sm">
                              {location.lobbyHours}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column: drive-up, ATM, services */}
                    <div className="flex flex-col gap-3">
                      {location.driveUpHours && (
                        <div className="flex items-start gap-2">
                          <Car
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                            strokeWidth={1.75}
                          />
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-deep-accent">
                              Drive Up Hours
                            </div>
                            <p className="text-xs text-body sm:text-sm">
                              {location.driveUpHours}
                            </p>
                          </div>
                        </div>
                      )}

                      {location.atm && (
                        <div className="flex items-start gap-2">
                          <CreditCard
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                            strokeWidth={1.75}
                          />
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-deep-accent">
                              ATM
                            </div>
                            <p className="text-xs text-body sm:text-sm">
                              {location.atm}
                            </p>
                          </div>
                        </div>
                      )}

                      {location.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {location.services.map((service, idx) => {
                            const Icon = getServiceIcon(service);
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 border border-hairline bg-faint px-2.5 py-1 text-[11px] font-medium text-body"
                              >
                                <Icon
                                  className="h-3 w-3 shrink-0 text-primary"
                                  strokeWidth={2}
                                />
                                {service}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-hairline bg-faint py-12 text-center">
              <Search
                className="mx-auto h-8 w-8 text-muted"
                strokeWidth={1.5}
              />
              <p className="mt-3 text-sm text-body">
                No locations found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationsPage;