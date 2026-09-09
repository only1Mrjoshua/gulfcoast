import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ContactsPage.module.css';

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
    mississippi: ['Hattiesburg']
  };

  return (
    <div className={styles.contactsPage}>
      {/* ============================================ */}
      {/* SECTION 1: HERO */}
      {/* ============================================ */}
        <section className={styles.hero}>
        <div className={styles.heroOverlay}>
            <div className="container">
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>Contact Us</h1>

                <p className={styles.heroDescription}>
                Live Customer Service Chat 7 days a week, 7 a.m.-9 p.m. Click the
                "Let's Talk!" bubble for online chat
                </p>
            </div>
            </div>
        </div>
        </section>

      {/* ============================================ */}
      {/* SECTION 2: SECURITY WARNING */}
      {/* ============================================ */}
      <section className={styles.securityWarning}>
        <div className="container">
          <p className={styles.securityText}>
            <strong>As a reminder, Gulf Coast Bank employees will NEVER call and ask for personal information</strong> such as your Social Security number, account numbers, Debit or Credit Card information, or Digital Banking Login ID and Password. If you receive a call even if it appears to be from us and you are unsure, please hang up and call your local banking office.
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: COMMERCIAL LENDERS */}
      {/* ============================================ */}
      <section className={styles.lendersSection}>
        <div className="container">
          <h2 className={styles.lendersTitle}>
            We have over 24 Commercial Lenders located throughout Southeast Louisiana, Florida, and Alabama.
          </h2>
          <div className={styles.regionTabs}>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'eastbank' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('eastbank')}
            >
              Eastbank
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'westbank' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('westbank')}
            >
              Westbank
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'stbernard' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('stbernard')}
            >
              St. Bernard
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'northshore' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('northshore')}
            >
              Northshore
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'batonrouge' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('batonrouge')}
            >
              Baton Rouge
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'florida' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('florida')}
            >
              Florida
            </button>
            <button 
              className={`${styles.regionTab} ${activeRegion === 'alabama' ? styles.activeRegion : ''}`}
              onClick={() => setActiveRegion('alabama')}
            >
              Alabama
            </button>
          </div>
          <div className={styles.regionLocations}>
            {regionData[activeRegion].map((location, idx) => (
              <span key={idx} className={styles.regionLocation}>{location}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: TOP WORKPLACES BADGE */}
      {/* ============================================ */}

      {/* ============================================ */}
      {/* SECTION 5: PRIMARY CONTACT CARDS */}
      {/* ============================================ */}
      <section className={styles.primaryCards}>
        <div className="container">
          <div className={styles.cardGrid}>
            {/* Card 1: Locations */}
            <div className={styles.contactCard}>
              <div className={styles.cardImage}>
                <img src="/uneven_columns.jpeg" alt="Locations" />
              </div>
              <h3 className={styles.cardTitle}>Locations</h3>
              <p className={styles.cardText}>
                Gulf Coast Bank &amp; Trust Co. has 23 branch locations throughout South Louisiana: New Orleans, Jefferson, Northshore, St. Bernard and Baton Rouge.
              </p>
              <p className={styles.cardSubtext}>
                For branch locations, please visit <Link to="/locations" className={styles.inlineLink}>our locations page</Link>.
              </p>
              <Link to="/locations" className={styles.cardBtn}>LEARN MORE</Link>
            </div>

            {/* Card 2: Customer Service */}
            <div className={styles.contactCard}>
              <div className={styles.cardImage}>
                <img src="/debit_card.jpeg" alt="Customer Service" />
              </div>
              <h3 className={styles.cardTitle}>Customer Service</h3>
              <p className={styles.cardText}>
                <strong>7 days a week, 7am-9pm</strong><br />
                <a href="tel:18002232060" className={styles.phoneLink}>1-800-223-2060</a><br />
                <a href="tel:15045616124" className={styles.phoneLink}>504-561-6124</a>
              </p>
              <p className={styles.cardText}>
                <strong>Live Customer Service Chat</strong><br />
                7 days a week, 9am-9pm<br />
                Click the "Let's Talk!" bubble<br />
                or fill out an <a href="#" className={styles.inlineLink}>online contact form</a>.
              </p>
              <a href="#" className={styles.cardBtn}>LEARN MORE</a>
            </div>

            {/* Card 3: Card Solutions */}
            <div className={styles.contactCard}>
              <div className={styles.cardImage}>
                <img src="/card_solutions.jpeg" alt="Card Solutions" />
              </div>
              <h3 className={styles.cardTitle}>Digital Banking Support</h3>
              <p className={styles.cardText}>
                <strong>Monday-Friday 8:30 am-5pm</strong><br />
                <a href="tel:15045445574" className={styles.phoneLink}>504-544-5574</a><br />
                <a href="tel:18002232060" className={styles.phoneLink}>1-800-223-2060</a>
              </p>
              <p className={styles.cardText}>
                <strong>24 Hour Telebanking Service Line</strong><br />
                <a href="tel:15045616123" className={styles.phoneLink}>504-561-6123</a>
              </p>
              <p className={styles.cardText}>
                Digital Banking unavailable?<br />
                <a href="#" className={styles.inlineLink}>Click here</a> for additional information.
              </p>
              <a href="#" className={styles.cardBtn}>LEARN MORE</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: BANKER APPOINTMENT CTA */}
      {/* ============================================ */}
      <section className={styles.appointmentSection}>
        <div className="container">
          <div className={styles.appointmentContent}>
            <p className={styles.appointmentText}>Set up an appointment with a banker.</p>
            <a href="#" className={styles.appointmentBtn}>BANKERS APPOINTMENT REQUEST</a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: DETAILED SUPPORT INFORMATION GRID */}
      {/* ============================================ */}
      <section className={styles.supportGrid}>
        <div className="container">
          <div className={styles.supportGridWrapper}>
            
            {/* Row 1: Travel, Card Services, Calendar */}
            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Travel Information</h4>
              <p className={styles.supportText}>
                Please notify Customer Service Department at <a href="tel:18002232060" className={styles.phoneLink}>1-800-223-2060</a> so that you can conveniently &amp; securely use your Debit Card. You can also email us at <a href="mailto:callcenter@gulfbank.com" className={styles.inlineLink}>callcenter@gulfbank.com</a>.
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Card Services</h4>
              <p className={styles.supportText}>
                <strong>Debit Card Activation, PIN Selection and Reset</strong><br />
                <a href="tel:18009923808" className={styles.phoneLink}>1-800-992-3808</a><br />
                <a href="#" className={styles.inlineLink}>Activation Instructions</a>
              </p>
              <p className={styles.supportText}>
                <strong>Debit, Credit Card Services</strong><br />
                <a href="tel:15045654640" className={styles.phoneLink}>504-565-4640</a>
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Calendar</h4>
              <p className={styles.supportText}>
                Complete list of Gulf Coast Bank's bank holidays:<br />
                <a href="#" className={styles.inlineLink}>2026 Gulf Coast Bank holiday calendar</a> and the PDF version.
              </p>
              <p className={styles.supportText}>
                <a href="#" className={styles.inlineLink}>2026 Holiday Processing Schedule</a>
              </p>
            </div>

            {/* Row 2: Support By Email, Lost Cards, Telebanking Assistance */}
            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Support By Email</h4>
              <p className={styles.supportText}>
                <a href="#" className={styles.inlineLink}>Secure Email Sign Up</a><br />
                <a href="#" className={styles.inlineLink}>Log In</a>
              </p>
              <p className={styles.supportText}>
                <strong>Customer Service</strong><br />
                <strong>Business Solutions</strong><br />
                <strong>Tuition Lending</strong><br />
                <strong>SBA Lending</strong><br />
                <strong>Wealth Management</strong>
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Lost Cards</h4>
              <p className={styles.supportText}>
                <strong>Lost and Stolen Cards After Hours</strong><br />
                <a href="tel:18005548969" className={styles.phoneLink}>1-800-554-8969</a>
              </p>
              <p className={styles.supportText}>
                <strong>Card Lost Internationally</strong><br />
                <a href="tel:16145645101" className={styles.phoneLink}>614-564-5101</a> <span className={styles.note}>(International rates apply)</span>
              </p>
              <p className={styles.supportText}>
                <strong>Lost or Stolen MasterCard Credit Card</strong><br />
                <a href="tel:18552050965" className={styles.phoneLink}>1-855-205-0965</a>
              </p>
              <p className={styles.supportText}>
                <strong>Card Lost Internationally</strong><br />
                <a href="tel:13012879918" className={styles.phoneLink}>301-287-9918</a> <span className={styles.note}>(International rates apply)</span>
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Telebanking Assistance</h4>
              <p className={styles.supportText}>
                Access your accounts via phone at any time
              </p>
              <p className={styles.supportText}>
                <a href="tel:15045616123" className={styles.phoneLink}>1-504-561-6123</a><br />
                <a href="tel:18669226123" className={styles.phoneLink}>1-866-922-6123</a>
              </p>
            </div>

            {/* Row 3: Tuition Loan, Wealth/Trust/Mortgage, Business Solutions/Credit */}
            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Tuition Loan Customer Support</h4>
              <p className={styles.supportText}>
                <strong>Support Numbers</strong><br />
                M-F 8am-4:30pm<br />
                <a href="tel:15045446370" className={styles.phoneLink}>504-544-6370</a><br />
                <a href="tel:18553352068" className={styles.phoneLink}>1-855-335-2068</a>
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Gulf Coast Wealth Management</h4>
              <p className={styles.supportText}>
                <strong>Support Number</strong><br />
                <a href="tel:15045653660" className={styles.phoneLink}>504-565-3660</a>
              </p>
              <h4 className={styles.supportHeadingSmall}>Trust Services</h4>
              <p className={styles.supportText}>
                <strong>Support Number</strong><br />
                <a href="tel:15048412850" className={styles.phoneLink}>504-841-2850</a>
              </p>
              <h4 className={styles.supportHeadingSmall}>Mortgage Services</h4>
              <p className={styles.supportText}>
                <strong>Support Number</strong><br />
                <a href="tel:18335784663" className={styles.phoneLink}>833-578-4663</a>
              </p>
            </div>

            <div className={styles.supportCard}>
              <h4 className={styles.supportHeading}>Business Solutions</h4>
              <p className={styles.supportText}>
                <strong>Support Numbers</strong><br />
                <a href="tel:15045446380" className={styles.phoneLink}>504-544-6380</a><br />
                <a href="tel:18667553887" className={styles.phoneLink}>1-866-755-3887</a>
              </p>
              <h4 className={styles.supportHeadingSmall}>Business Credit</h4>
              <p className={styles.supportText}>
                <strong>Support Numbers</strong><br />
                <a href="tel:19852497200" className={styles.phoneLink}>985-249-7200</a><br />
                <a href="tel:18665778867" className={styles.phoneLink}>1-866-577-8867</a>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: BRANCH LOCATIONS */}
      {/* ============================================ */}
      <section className={styles.branchLocations}>
        <div className="container">
          <h3 className={styles.branchTitle}>BRANCH LOCATIONS</h3>
          <div className={styles.branchDirectory}>
            {/* Eastbank */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>EASTBANK</div>
              <div className={styles.branchNames}>
                <span>Carrollton</span>
                <span>Lakeview</span>
                <span>Magazine</span>
                <span>Main Office</span>
                <span>Transcontinental</span>
                <span>Veterans</span>
                <span>Williams</span>
                <span>Elmwood</span>
              </div>
            </div>

            {/* Northshore */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>NORTHSHORE</div>
              <div className={styles.branchNames}>
                <span>Boston Street</span>
                <span>Covington</span>
                <span>Hammond</span>
                <span>Mandeville - Hwy 22</span>
                <span>Slidell</span>
              </div>
            </div>

            {/* Westbank */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>WESTBANK</div>
              <div className={styles.branchNames}>
                <span>Gretna</span>
                <span>Manhattan</span>
                <span>Terrytown</span>
              </div>
            </div>

            {/* Baton Rouge */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>BATON ROUGE</div>
              <div className={styles.branchNames}>
                <span>Old Goodwood</span>
                <span>Perkins</span>
              </div>
            </div>

            {/* St. Bernard */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>ST. BERNARD</div>
              <div className={styles.branchNames}>
                <span>Business Center</span>
                <span>Civic Center</span>
              </div>
            </div>

            {/* Alabama */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>ALABAMA</div>
              <div className={styles.branchNames}>
                <span>Orange Beach</span>
              </div>
            </div>

            {/* Florida */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>FLORIDA</div>
              <div className={styles.branchNames}>
                <span>Miramar Beach</span>
              </div>
            </div>

            {/* Mississippi */}
            <div className={styles.branchRow}>
              <div className={styles.branchLabel}>MISSISSIPPI</div>
              <div className={styles.branchNames}>
                <span>Hattiesburg</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactsPage;