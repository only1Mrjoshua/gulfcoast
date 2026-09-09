// src/pages/Help.jsx
import React, { useState } from 'react';
import {
  mockHelpTopics,
  mockHelpFAQs,
  mockSupportChannels,
  mockSecurityResources,
} from '../data/mockHelpData';
import styles from './Help.module.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleFAQToggle = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = mockHelpFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = mockHelpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.helpPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Help & Support</h1>
          <p className={styles.pageSubtitle}>
            Find answers, get support, and manage your banking questions securely.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="How can we help?"
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Popular Help Topics */}
      {!searchQuery && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Popular Help Topics</h2>
          <div className={styles.topicsGrid}>
            {mockHelpTopics.map(topic => (
              <div key={topic.id} className={styles.topicCard}>
                <span className={styles.topicIcon}>{topic.icon}</span>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p className={styles.topicDescription}>{topic.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Results */}
      {searchQuery && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Search Results</h2>
          {filteredTopics.length === 0 && filteredFAQs.length === 0 ? (
            <div className={styles.noResults}>
              <p>We couldn't find an answer</p>
              <p className={styles.noResultsSub}>Try a different search term or contact support for assistance.</p>
              <button className={styles.contactSupportBtn}>Contact Support</button>
            </div>
          ) : (
            <div className={styles.searchResults}>
              {filteredTopics.length > 0 && (
                <>
                  <h3 className={styles.resultCategory}>Topics</h3>
                  {filteredTopics.map(topic => (
                    <div key={topic.id} className={styles.resultItem}>
                      <span className={styles.resultIcon}>{topic.icon}</span>
                      <span className={styles.resultTitle}>{topic.title}</span>
                      <span className={styles.resultDesc}>{topic.description}</span>
                    </div>
                  ))}
                </>
              )}
              {filteredFAQs.length > 0 && (
                <>
                  <h3 className={styles.resultCategory}>FAQs</h3>
                  {filteredFAQs.map(faq => (
                    <div key={faq.id} className={styles.resultItem}>
                      <span className={styles.resultTitle}>{faq.question}</span>
                      <span className={styles.resultDesc}>{faq.answer}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* Quick Support */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Support</h2>
        <div className={styles.supportGrid}>
          {mockSupportChannels.map((channel, idx) => (
            <div key={idx} className={styles.supportCard}>
              <span className={styles.supportIcon}>{channel.icon}</span>
              <h3 className={styles.supportTitle}>{channel.label}</h3>
              <p className={styles.supportDesc}>{channel.description}</p>
              <button className={styles.supportAction}>Learn More</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {mockHelpFAQs.map(faq => (
            <div key={faq.id} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => handleFAQToggle(faq.id)}
              >
                <span>{faq.question}</span>
                <span className={styles.faqArrow}>
                  {expandedFAQ === faq.id ? '▾' : '▸'}
                </span>
              </button>
              {expandedFAQ === faq.id && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Security Center */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Security Center</h2>
        <div className={styles.securityGrid}>
          {mockSecurityResources.map((resource, idx) => (
            <button key={idx} className={styles.securityItem}>
              <span className={styles.securityIcon}>{resource.icon}</span>
              <span className={styles.securityLabel}>{resource.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>We're here to help</h2>
        <div className={styles.contactOptions}>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📞</span>
            <span className={styles.contactLabel}>Phone</span>
            <span className={styles.contactValue}>Available 24/7</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>💬</span>
            <span className={styles.contactLabel}>Secure Message</span>
            <span className={styles.contactValue}>Reply within 24 hours</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>🏛️</span>
            <span className={styles.contactLabel}>Branch Support</span>
            <span className={styles.contactValue}>Visit us in person</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📍</span>
            <span className={styles.contactLabel}>ATM/Branch Locator</span>
            <span className={styles.contactValue}>Find locations near you</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;