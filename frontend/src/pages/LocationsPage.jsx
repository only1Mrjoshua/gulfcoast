import { useState, useEffect } from 'react';
import styles from './LocationsPage.module.css';

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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: ''
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
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
    atm: 'ATM - Deposit Cash and Checks | Community Cash ATM'
  }
];

function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('any');
  const [filterDistance, setFilterDistance] = useState('any');
  const [sortBy, setSortBy] = useState('name');
  const [filteredLocations, setFilteredLocations] = useState(locationsData);

  const types = ['any', ...new Set(locationsData.map(loc => loc.type))];

  useEffect(() => {
    let results = locationsData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(loc =>
        loc.name.toLowerCase().includes(term) ||
        loc.city.toLowerCase().includes(term) ||
        loc.state.toLowerCase().includes(term) ||
        loc.address.toLowerCase().includes(term) ||
        loc.zip.includes(term)
      );
    }

    if (filterType !== 'any') {
      results = results.filter(loc => loc.type === filterType);
    }

    if (filterDistance !== 'any') {
      const maxDist = parseFloat(filterDistance);
      results = results.filter(loc => {
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
    <div className={styles.locationsPage}>
      <div className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <img src="/map.png" alt="Map of locations" className={styles.mapImage} />
        </div>
      </div>

      <div className={styles.listSection}>
        <div className="container">
          <h1 className={styles.pageTitle}>Locations</h1>
          <p className={styles.pageDescription}>
            With {locationsData.length} locations, Gulf Coast Bank &amp; Trust serves Baton Rouge, New Orleans Metro Area, Florida, Alabama, and Mississippi.
          </p>

          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by city, address, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.searchBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                  <path d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"/>
                </svg>
              </button>
            </div>

            <div className={styles.filterWrapper}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'any' ? 'All Types' : type}
                  </option>
                ))}
              </select>

              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(e.target.value)}
                className={styles.filterSelect}
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

          <div className={styles.sortWrapper}>
            <span className={styles.resultsCount}>{filteredLocations.length} locations found</span>
            <div className={styles.sortOptions}>
              <span className={styles.sortLabel}>Sort by:</span>
              <button
                className={`${styles.sortBtn} ${sortBy === 'name' ? styles.activeSort : ''}`}
                onClick={() => setSortBy('name')}
              >
                Name
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === 'city' ? styles.activeSort : ''}`}
                onClick={() => setSortBy('city')}
              >
                City
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === 'distance' ? styles.activeSort : ''}`}
                onClick={() => setSortBy('distance')}
              >
                Distance
              </button>
            </div>
          </div>

          <div className={styles.locationList}>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div key={location.id} className={styles.locationCard}>
                  <div className={styles.locationInfo}>
                    <div className={styles.locationHeader}>
                      <h3 className={styles.locationName}>{location.name}</h3>
                      <span className={styles.locationType}>{location.type}</span>
                      <span className={styles.locationDistanceBadge}>{location.distance} miles</span>
                    </div>
                    <p className={styles.locationAddress}>
                      {location.address}<br />
                      {location.city}, {location.state} {location.zip}
                    </p>
                    {location.phone && (
                      <p className={styles.locationPhone}>{location.phone}</p>
                    )}
                    {location.lobbyHours && (
                      <p className={styles.locationHours}>
                        <strong>Lobby Hours</strong><br />
                        {location.lobbyHours}
                      </p>
                    )}
                    {location.driveUpHours && (
                      <p className={styles.locationHours}>
                        <strong>Drive Up Hours</strong><br />
                        {location.driveUpHours}
                      </p>
                    )}
                    {location.atm && (
                      <p className={styles.locationAtm}>
                        <strong>ATM</strong><br />
                        {location.atm}
                      </p>
                    )}
                    {location.services.length > 0 && (
                      <div className={styles.locationServices}>
                        {location.services.map((service, idx) => (
                          <span key={idx} className={styles.serviceTag}>{service}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noResults}>No locations found matching your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationsPage;