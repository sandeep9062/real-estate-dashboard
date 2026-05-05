/**
 * Schema Markup (JSON-LD) Utilities for PropertyBulbul
 * Server-side only implementation with safety checks
 */

import React from "react";

// Check if we're running on server (safety check)
export const isServer = typeof window === "undefined";

/**
 * Generate RealEstateListing Schema
 */
export function generateRealEstateSchema(property: any, id: string) {
  if (!isServer) return null;

  const imageUrls = (property?.image || []).filter((img: string) => {
    const lower = img.toLowerCase();
    return !(
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg")
    );
  });

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: sanitizeText(property?.title || ""),
    description: sanitizeText(property?.description || ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: property?.location?.address,
      addressLocality: property?.location?.sector || property?.location?.city,
      addressRegion: property?.location?.city,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: property?.price,
      priceCurrency: "INR",
      availability:
        property?.availability === "Available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    offerType: property?.deal,
    numberOfRooms: property?.facilities?.bedrooms || 0,
    numberOfBathrooms: property?.facilities?.bathrooms || 0,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property?.area?.value,
      unitCode: property?.area?.unit === "sqft" ? "FTK" : "MTK",
    },
    image: imageUrls,
    url: `https://propertybulbul.com/property/${id}`,
    provider: {
      "@type": "Organization",
      name: "Propertybulbul",
      url: "https://propertybulbul.com",
    },
  };
}

/**
 * Generate Article Schema for Journal/Blog posts
 */
export function generateArticleSchema(journal: any, slug: string) {
  if (!isServer) return null;

  const canonicalUrl = `https://propertybulbul.com/journal/${slug}`;
  const imageUrl =
    journal.coverImage || "https://propertybulbul.com/property-tricity.jpg";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: journal.title,
    description: sanitizeText(
      stripHtml(journal.content)?.substring(0, 250) || journal.title,
    ),
    image: imageUrl,
    datePublished: journal.createdAt,
    dateModified: journal.updatedAt || journal.createdAt,
    author: {
      "@type": "Organization",
      name: journal.author || "PropertyBulbul Editorial",
      url: "https://propertybulbul.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Propertybulbul",
      logo: {
        "@type": "ImageObject",
        url: "https://propertybulbul.com/propertybulbul.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    wordCount: journal.content?.split(/\s+/).length || 0,
  };
}

/**
 * Generate FAQPage Schema
 * Auto extracts FAQs from content or uses default location based questions
 */
export function generateFAQSchema(content: string, location?: string) {
  if (!isServer) return null;

  const faqs: Array<{ question: string; answer: string }> = [];

  // Auto extract FAQ items from content if they exist
  const extractedFaqs = extractFAQsFromContent(content);
  faqs.push(...extractedFaqs);

  // Add location specific common questions
  if (location) {
    faqs.push(
      {
        question: `Is ${location} safe to live?`,
        answer: `${location} is considered one of the safest localities with excellent infrastructure, good connectivity, and low crime rates. It's a preferred residential area for families and professionals.`,
      },
      {
        question: `What are property prices in ${location}?`,
        answer: `Property prices in ${location} vary depending on property type, size, and amenities. Current rates range from ₹4,500 to ₹8,000 per sq ft for residential apartments.`,
      },
      {
        question: `What facilities are available in ${location}?`,
        answer: `${location} offers excellent amenities including schools, hospitals, shopping centers, parks, good road connectivity, and public transport facilities.`,
      },
    );
  }

  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; item: string }>,
) {
  if (!isServer) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/**
 * Helper: Strip HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Helper: Sanitize text for schema
 */
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/0\s*BHK/gi, "Studio/1BHK")
    .replace(/[\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Helper: Extract FAQ items from content looking for common patterns
 */
function extractFAQsFromContent(
  content: string,
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  if (!content) return faqs;

  // Look for Q: / A: patterns or FAQ sections
  const faqRegex =
    /(?:Q:|Question:|FAQ:)\s*(.*?)(?:\n|$)(?:A:|Answer:)\s*(.*?)(?=\n\n|\nQ:|\nQuestion:|$)/gis;
  let match;

  while ((match = faqRegex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      faqs.push({
        question: stripHtml(match[1]).trim(),
        answer: stripHtml(match[2]).trim(),
      });
    }
  }

  return faqs;
}

/**
 * Render Schema Script Tag safely
 */
export function renderSchemaScript(id: string, schema: any) {
  if (!schema || !isServer) return null;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
