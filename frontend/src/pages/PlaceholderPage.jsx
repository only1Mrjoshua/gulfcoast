function PlaceholderPage({ title }) {
  return (
    <section className="section-padding container" style={{ minHeight: '60vh' }}>
      <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)' }}>{title}</h1>
      <p>This page is under construction. Check back soon!</p>
    </section>
  );
}

export default PlaceholderPage;