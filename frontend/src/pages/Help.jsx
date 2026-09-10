// src/pages/Help.jsx
import React, { useState } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  MessageCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Lock,
  AlertCircle,
  KeyRound,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Landmark,
  HelpCircle,
  FileText,
  Info,
  UserRound,
  Fingerprint,
  Mail,
  LifeBuoy,
  BookOpen,
  Smartphone,
  Globe,
  Receipt,
  PiggyBank,
} from 'lucide-react';
import {
  mockHelpTopics,
  mockHelpFAQs,
  mockSupportChannels,
  mockSecurityResources,
} from '../data/mockHelpData';

// Map help-topic emojis/labels to professional Lucide icons
const getTopicIcon = (topic) => {
  const key = `${topic.title || ''} ${topic.description || ''}`.toLowerCase();
  if (key.includes('account access') || key.includes('login') || key.includes('password'))
    return KeyRound;
  if (key.includes('card')) return CreditCard;
  if (key.includes('transfer')) return ArrowLeftRight;
  if (key.includes('payment') || key.includes('bill')) return Receipt;
  if (key.includes('security') || key.includes('fraud')) return ShieldCheck;
  if (key.includes('account')) return Wallet;
  if (key.includes('deposit') || key.includes('savings')) return PiggyBank;
  if (key.includes('profile') || key.includes('personal')) return UserRound;
  if (key.includes('statement') || key.includes('document')) return FileText;
  if (key.includes('mobile') || key.includes('app')) return Smartphone;
  if (key.includes('online') || key.includes('website')) return Globe;
  return HelpCircle;
};

// Map support-channel labels to icons
const getSupportIcon = (channel) => {
  const key = `${channel.label || ''}`.toLowerCase();
  if (key.includes('phone') || key.includes('call')) return Phone;
  if (key.includes('message') || key.includes('chat')) return MessageCircle;
  if (key.includes('branch') || key.includes('visit')) return Building2;
  if (key.includes('email') || key.includes('mail')) return Mail;
  if (key.includes('faq') || key.includes('guide')) return BookOpen;
  return LifeBuoy;
};

// Map security-resource labels to icons
const getSecurityIcon = (resource) => {
  const key = `${resource.label || ''}`.toLowerCase();
  if (key.includes('lock') || key.includes('password')) return Lock;
  if (key.includes('fraud') || key.includes('alert') || key.includes('report'))
    return AlertCircle;
  if (key.includes('identity') || key.includes('id')) return Fingerprint;
  if (key.includes('card')) return CreditCard;
  if (key.includes('privacy') || key.includes('security')) return ShieldCheck;
  return ShieldCheck;
};

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleFAQToggle = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = mockHelpFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = mockHelpTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const contactOptions = [
    { icon: Phone, label: 'Phone', value: 'Available 24/7' },
    { icon: MessageCircle, label: 'Secure Message', value: 'Reply within 24 hours' },
    { icon: Building2, label: 'Branch Support', value: 'Visit us in person' },
    { icon: MapPin, label: 'ATM/Branch Locator', value: 'Find locations near you' },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 border-b border-hairline pb-5">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
          Help &amp; Support
        </h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Find answers, get support, and manage your banking questions securely.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
          <Search
            className="ml-3 h-4 w-4 shrink-0 text-muted sm:ml-4 sm:h-5 sm:w-5"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="How can we help?"
            value={searchQuery}
            onChange={handleSearch}
            className="min-h-[48px] w-full border-none bg-transparent px-3 py-3 text-sm text-deep-accent outline-none placeholder:text-muted/70 sm:min-h-[52px] sm:text-base"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted hover:text-deep-accent"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>

      {/* Popular Help Topics (only when no search) */}
      {!searchQuery && (
        <section className="mb-10 border-t border-hairline pt-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Popular Help Topics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockHelpTopics.map((topic) => {
              const Icon = getTopicIcon(topic);
              return (
                <div
                  key={topic.id}
                  className="flex flex-col items-start border border-hairline bg-white p-5 transition-colors hover:border-primary"
                >
                  <span className="flex h-10 w-10 items-center justify-center bg-[#e7f3f5] text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-deep-accent sm:text-base">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-xs text-body sm:text-sm">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search Results */}
      {searchQuery && (
        <section className="mb-10 border-t border-hairline pt-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Search Results
          </h2>

          {filteredTopics.length === 0 && filteredFAQs.length === 0 ? (
            <div className="border border-hairline bg-faint py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-deep-accent">
                We couldn&rsquo;t find an answer
              </p>
              <p className="mx-auto mt-1 max-w-md px-4 text-xs text-muted">
                Try a different search term or contact support for assistance.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <LifeBuoy className="h-3.5 w-3.5" strokeWidth={2.25} />
                Contact Support
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTopics.length > 0 && (
                <>
                  <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-deep-accent">
                    Topics
                  </h3>
                  {filteredTopics.map((topic) => {
                    const Icon = getTopicIcon(topic);
                    return (
                      <div
                        key={topic.id}
                        className="flex flex-col gap-2 border border-hairline bg-faint px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-deep-accent">
                          {topic.title}
                        </span>
                        <span className="min-w-0 text-xs text-body sm:text-sm">
                          {topic.description}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              {filteredFAQs.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-deep-accent">
                    FAQs
                  </h3>
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="flex flex-col gap-1 border border-hairline bg-faint px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-deep-accent">
                        {faq.question}
                      </span>
                      <span className="text-xs text-body sm:text-sm">
                        {faq.answer}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* Quick Support */}
      <section className="mb-10 border-t border-hairline pt-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Quick Support
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockSupportChannels.map((channel, idx) => {
            const Icon = getSupportIcon(channel);
            return (
              <div
                key={idx}
                className="flex flex-col items-start border border-hairline bg-white p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center bg-[#e7f3f5] text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-deep-accent sm:text-base">
                  {channel.label}
                </h3>
                <p className="mt-1 text-xs text-body sm:text-sm">
                  {channel.description}
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  Learn More
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-10 border-t border-hairline pt-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-faint border-t border-hairline">
          {mockHelpFAQs.map((faq) => {
            const isOpen = expandedFAQ === faq.id;
            return (
              <div key={faq.id} className="border-b border-faint last:border-b-0">
                <button
                  type="button"
                  onClick={() => handleFAQToggle(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="text-sm font-semibold text-deep-accent sm:text-base">
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-muted">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                    ) : (
                      <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-4 text-sm leading-relaxed text-body sm:text-base">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Center */}
      <section className="mb-10 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Security Center
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mockSecurityResources.map((resource, idx) => {
            const Icon = getSecurityIcon(resource);
            return (
              <button
                key={idx}
                type="button"
                className="flex items-center gap-3 border border-hairline bg-white px-4 py-3 text-left transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                  {resource.label}
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted"
                  strokeWidth={2.25}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact Support */}
      <section className="mb-4 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            We&rsquo;re here to help
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactOptions.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col border border-hairline bg-white p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center bg-[#e7f3f5] text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="mt-3 text-sm font-bold text-deep-accent sm:text-base">
                {label}
              </span>
              <span className="mt-0.5 text-xs text-muted sm:text-sm">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Help;