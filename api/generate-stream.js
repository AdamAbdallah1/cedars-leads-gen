export const config = {
  runtime: "nodejs",
};

const API_KEY = "AIzaSyC_O6j2914xdG8etm-kSk4Od0_YF2SIum4";

const CATEGORIES = {
  "Medical & Clinics": [
    "private medical clinic {city}",
    "specialist doctor clinic {city}",
    "dental clinic {city}",
    "pediatrician {city}",
    "diagnostic center {city}"
  ],
  "Law & Consulting": [
    "law office {city}",
    "legal consultancy {city}",
    "corporate lawyer {city}",
    "notary public {city}",
    "tax attorney {city}"
  ],
  "Real Estate & Construction": [
    "real estate brokerage {city}",
    "architecture office {city}",
    "construction company {city}",
    "interior design studio {city}",
    "property management {city}"
  ],
  "Finance & Accounting": [
    "accounting firm {city}",
    "tax consultancy {city}",
    "audit firm {city}",
    "wealth management {city}",
    "insurance broker {city}"
  ],
  "Education & Training": [
    "private school {city}",
    "training center {city}",
    "language institute {city}",
    "music school {city}",
    "vocational college {city}"
  ],
  "Marketing & Media": [
    "digital marketing agency {city}",
    "advertising agency {city}",
    "branding consultancy {city}",
    "video production studio {city}",
    "social media agency {city}"
  ],
  "Beauty & Wellness": [
    "beauty salon {city}",
    "spa {city}",
    "fitness center {city}",
    "yoga studio {city}",
    "hair transplant clinic {city}"
  ],
  "IT & Software": [
    "software development company {city}",
    "web development agency {city}",
    "tech startup {city}",
    "cybersecurity firm {city}",
    "it support services {city}"
  ],
  "Logistics & Transport": [
    "logistics company {city}",
    "freight forwarder {city}",
    "courier service {city}",
    "warehouse facility {city}",
    "moving company {city}"
  ],
  "Hospitality & Food": [
    "restaurant {city}",
    "cafe {city}",
    "catering service {city}",
    "hotel {city}",
    "bakery {city}"
  ],
  "Retail & Showrooms": [
    "furniture showroom {city}",
    "clothing boutique {city}",
    "jewelry store {city}",
    "electronics shop {city}",
    "optical shop {city}"
  ],
  "Automotive": [
    "car dealership {city}",
    "auto repair shop {city}",
    "car rental agency {city}",
    "tire center {city}",
    "car detailing studio {city}"
  ],

  // ✅ NEW ONES YOU WERE MISSING

  "Solar & Green Energy": [
    "solar panel company {city}",
    "renewable energy firm {city}",
    "solar installation services {city}",
    "green energy solutions {city}",
    "solar inverter supplier {city}"
  ],
  "E-commerce & Boutiques": [
    "online store {city}",
    "ecommerce business {city}",
    "fashion boutique {city}",
    "instagram shop {city}",
    "retail startup {city}"
  ],
  "Insurance Agencies": [
    "insurance agency {city}",
    "life insurance office {city}",
    "car insurance broker {city}",
    "health insurance company {city}",
    "insurance consultancy {city}"
  ],
  "Travel & Tourism": [
    "travel agency {city}",
    "tour operator {city}",
    "tourism office {city}",
    "holiday planner {city}",
    "visa services {city}"
  ],
  "Industrial & Factories": [
    "manufacturing factory {city}",
    "industrial company {city}",
    "production plant {city}",
    "packaging factory {city}",
    "metal works factory {city}"
  ],
  "Event Planning & Venues": [
    "event planning company {city}",
    "wedding venue {city}",
    "banquet hall {city}",
    "conference center {city}",
    "event organizer {city}"
  ],
  "Interior Design": [
    "interior design studio {city}",
    "home decor company {city}",
    "office fitout firm {city}",
    "furniture design studio {city}",
    "space planning service {city}"
  ],
  "Pet Care & Vets": [
    "veterinary clinic {city}",
    "pet shop {city}",
    "animal hospital {city}",
    "pet grooming salon {city}",
    "pet boarding service {city}"
  ]
};


const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPlaces(query, pageToken) {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  if (pageToken) url += `&pagetoken=${pageToken}`;
  if (pageToken) await delay(2000);

  const res = await fetch(url);
  const data = await res.json();
  return {
    results: data.results || [],
    next_page_token: data.next_page_token
  };
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,website,formatted_address,url&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result || {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { category, city } = req.body || {};

  if (!city || !CATEGORIES[category]) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const queries = CATEGORIES[category].map(q => q.replace("{city}", city));
  const seenIds = new Set();

  for (let i = 0; i < queries.length; i++) {
    let pageToken = null;

    while (true) {
      const { results, next_page_token } = await getPlaces(queries[i], pageToken);

      for (const place of results) {
        const pid = place.place_id;
        if (seenIds.has(pid)) continue;
        seenIds.add(pid);

        const details = await getPlaceDetails(pid);
        if (details.formatted_phone_number) {
          const lead = {
            Category: category,
            Name: details.name,
            Phone: details.formatted_phone_number,
            Website: details.website,
            Address: details.formatted_address,
            Maps: details.url
          };

          res.write(JSON.stringify({ type: "lead", data: lead }) + "\n");
        }
      }

      if (!next_page_token) break;
      pageToken = next_page_token;
    }

    const progress = Math.round(((i + 1) / queries.length) * 100);
    res.write(JSON.stringify({ type: "progress", data: progress }) + "\n");
  }

  res.end();
}
