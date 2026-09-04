import { createFileRoute } from "@tanstack/react-router";

import { About } from "../components/site/About";
import { Amenities } from "../components/site/Amenities";
import { Availability } from "../components/site/Availability";
import { Faq, FAQ_ITEMS } from "../components/site/Faq";
import { Footer } from "../components/site/Footer";
import { Gallery } from "../components/site/Gallery";
import { Hero } from "../components/site/Hero";
import { Location } from "../components/site/Location";
import { Marquee } from "../components/site/Marquee";
import { Nav } from "../components/site/Nav";
import { Reviews } from "../components/site/Reviews";
import { Stats } from "../components/site/Stats";
import { StructuredData } from "../components/site/StructuredData";

const SITE_URL = "https://rileklu.higgsfield.app";

const SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#business`,
      name: "RilekLU by Secret Oasis",
      description:
        "Entire industrial-loft homestay in Damansara Perdana, Petaling Jaya, with a pool table, PS4, Netflix and two balconies. Sleeps up to 5 guests.",
      url: SITE_URL,
      image: `${SITE_URL}/assets/hero.jpg`,
      telephone: ["+60136180059", "+60183531696"],
      email: "secret.oasis.co@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Colonial Loft, Empire City, Damansara Perdana",
        addressLocality: "Petaling Jaya",
        addressRegion: "Selangor",
        addressCountry: "MY",
      },
      checkinTime: "15:00",
      checkoutTime: "12:00",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.71",
        reviewCount: "87",
        bestRating: "5",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "RilekLU",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#business` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RilekLU: Industrial Loft Homestay in Damansara Perdana" },
      {
        name: "description",
        content:
          "RilekLU is an entire industrial-loft homestay in Damansara Perdana, Petaling Jaya with a pool table, PS4, Netflix and two balconies. Sleeps up to 5. 4.71/5 on Airbnb.",
      },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <StructuredData json={SCHEMA} />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Amenities />
        <Gallery />
        <Reviews />
        <Stats />
        <Availability />
        <Location />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
