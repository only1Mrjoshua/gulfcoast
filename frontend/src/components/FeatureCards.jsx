// src/components/FeatureCards.jsx
const features = [
  {
    title: 'Interest Checking',
    description:
      'Earn interest on your balance with an Interest Checking Account featuring no monthly service fee and no minimum balance required.',
    link: '/personal/checking',
    image: '/homepage_pic_2.png',
  },
  {
    title: 'Mortgage Loans',
    description:
      'Searching for a home? We offer a variety of loan programs to fit your needs. Connect with one of our mortgage lenders and start the pre-qualification process today.',
    link: '/personal/mortgage',
    image: '/smaller_homepage_pic_2.png',
  },
  {
    title: 'Business Solutions',
    description:
      'No matter how large or small your business may be, save time and money through a variety of solutions designed to fit your needs.',
    link: '/business/solutions',
    image: '/homepage_pic_1.png',
  },
];

function FeatureCards() {
  return (
    <section className="bg-[#313538] py-10 md:py-14 lg:py-[60px]">
      <div className="container-bank">
        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-9">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex h-full flex-col overflow-hidden bg-canvas shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
            >
              {/* Image with teal underline */}
              <div className="relative mx-[13px] mt-[15px] h-[180px] overflow-hidden bg-black sm:h-[220px] lg:h-[307px]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="block h-full w-full object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-2 bg-[#008a99]"
                  aria-hidden="true"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col px-[25px] pb-[26px] pt-[17px]">
                <h3 className="mb-[7px] font-serif text-[17px] font-bold leading-tight text-muted sm:text-[19px] lg:text-[22px]">
                  {item.title}
                </h3>
                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-muted sm:text-[15px] lg:text-[17px]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Locally Owned banner */}
        <div className="mt-8 flex min-h-[90px] flex-col items-center justify-center py-[30px] text-center sm:min-h-[110px] sm:py-10 lg:min-h-[140px] lg:py-[60px]">
          <h2 className="font-serif text-[20px] font-bold leading-tight text-[#E9682A] sm:text-[26px] lg:text-[32px]">
            LOCALLY OWNED AND OPERATED
          </h2>
          <p className="mt-1 whitespace-normal text-[20px] font-light leading-tight text-[#F1F1F1] sm:whitespace-nowrap sm:text-[28px] lg:text-[36px]">
            Helping our customers achieve their financial goals
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;