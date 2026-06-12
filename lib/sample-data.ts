import type { Category, City, Event } from "@/lib/types";

const now = new Date("2026-06-10T12:00:00-04:00");

const isoAfter = (days: number, hour: number, minutes = 0) => {
  const date = new Date(now);
  date.setDate(now.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
};

export const cities: City[] = [
  {
    id: "city-north-ridgeville",
    name: "North Ridgeville",
    slug: "north-ridgeville",
    county: "Lorain",
    state: "OH",
    latitude: 41.3895,
    longitude: -82.019,
    seo_title: "Things to Do in North Ridgeville, Ohio This Weekend",
    seo_description: "Find family events, festivals, markets, live music, and local happenings in North Ridgeville this weekend.",
    intro_text: "North Ridgeville sits close to parks, schools, local restaurants, and west-side routes, making it an easy weekend launch point for families and neighbors."
  },
  {
    id: "city-avon",
    name: "Avon",
    slug: "avon",
    county: "Lorain",
    state: "OH",
    latitude: 41.4517,
    longitude: -82.0354,
    seo_title: "Things to Do in Avon, Ohio This Weekend",
    seo_description: "Browse upcoming Avon events, from local markets and youth sports to dining, music, and community gatherings.",
    intro_text: "Avon blends new shopping districts, neighborhood parks, and community events with quick access to the rest of Lorain County."
  },
  {
    id: "city-avon-lake",
    name: "Avon Lake",
    slug: "avon-lake",
    county: "Lorain",
    state: "OH",
    latitude: 41.5053,
    longitude: -82.0282,
    seo_title: "Things to Do in Avon Lake, Ohio This Weekend",
    seo_description: "Discover lakefront events, family activities, and weekend plans around Avon Lake.",
    intro_text: "Avon Lake weekends often revolve around the shoreline, parks, schools, and relaxed neighborhood gatherings."
  },
  {
    id: "city-elyria",
    name: "Elyria",
    slug: "elyria",
    county: "Lorain",
    state: "OH",
    latitude: 41.3684,
    longitude: -82.1077,
    seo_title: "Things to Do in Elyria, Ohio This Weekend",
    seo_description: "Find Elyria events, concerts, arts programs, markets, and family-friendly things to do.",
    intro_text: "Elyria is a practical hub for Lorain County events, with civic spaces, parks, historic venues, and community traditions."
  },
  {
    id: "city-westlake",
    name: "Westlake",
    slug: "westlake",
    county: "Cuyahoga",
    state: "OH",
    latitude: 41.4553,
    longitude: -81.9179,
    seo_title: "Things to Do in Westlake, Ohio This Weekend",
    seo_description: "Explore Westlake restaurants, shopping events, live music, fitness events, and family activities.",
    intro_text: "Westlake offers easygoing weekends with Crocker Park, recreation programs, restaurants, and quick access to nearby lake communities."
  },
  {
    id: "city-bay-village",
    name: "Bay Village",
    slug: "bay-village",
    county: "Cuyahoga",
    state: "OH",
    latitude: 41.4848,
    longitude: -81.9221,
    seo_title: "Things to Do in Bay Village, Ohio This Weekend",
    seo_description: "Plan a Bay Village weekend with lakefront activities, nature programs, family events, and neighborhood happenings.",
    intro_text: "Bay Village is known for lakefront parks, trails, civic events, and a quieter community rhythm along the western edge of Cuyahoga County."
  },
  {
    id: "city-strongsville",
    name: "Strongsville",
    slug: "strongsville",
    county: "Cuyahoga",
    state: "OH",
    latitude: 41.3145,
    longitude: -81.8357,
    seo_title: "Things to Do in Strongsville, Ohio This Weekend",
    seo_description: "Find Strongsville festivals, sports, shopping events, family activities, and weekend plans.",
    intro_text: "Strongsville has big-city convenience, park access, shopping, youth sports, and a steady calendar of community events."
  },
  {
    id: "city-medina",
    name: "Medina",
    slug: "medina",
    county: "Medina",
    state: "OH",
    latitude: 41.1384,
    longitude: -81.8637,
    seo_title: "Things to Do in Medina, Ohio This Weekend",
    seo_description: "Browse Medina square events, markets, live music, community programs, and family-friendly weekend plans.",
    intro_text: "Medina weekends often center on the square, local shops, seasonal festivals, and friendly events with a small-town feel."
  },
  {
    id: "city-lakewood",
    name: "Lakewood",
    slug: "lakewood",
    county: "Cuyahoga",
    state: "OH",
    latitude: 41.4817,
    longitude: -81.7982,
    seo_title: "Things to Do in Lakewood, Ohio This Weekend",
    seo_description: "Find Lakewood concerts, nightlife, food events, arts programs, and family activities.",
    intro_text: "Lakewood packs restaurants, bars, parks, venues, and arts events into one of Northeast Ohio's most walkable weekend corridors."
  },
  {
    id: "city-cleveland",
    name: "Cleveland",
    slug: "cleveland",
    county: "Cuyahoga",
    state: "OH",
    latitude: 41.4993,
    longitude: -81.6944,
    seo_title: "Things to Do in Cleveland, Ohio This Weekend",
    seo_description: "Discover Cleveland events, festivals, concerts, sports, arts, nightlife, and family-friendly things to do.",
    intro_text: "Cleveland anchors the regional calendar with major venues, museums, neighborhoods, sports, festivals, and food-focused weekends."
  }
];

export const categories: Category[] = [
  { id: "cat-festivals", name: "Festivals", slug: "festivals", description: "Seasonal fairs, street festivals, cultural celebrations, and community traditions." },
  { id: "cat-food-drink", name: "Food & Drink", slug: "food-drink", description: "Restaurant events, tastings, pop-ups, brewery nights, and culinary happenings." },
  { id: "cat-live-music", name: "Live Music", slug: "live-music", description: "Concerts, open mics, acoustic sets, bands, DJs, and performances." },
  { id: "cat-family", name: "Family", slug: "family", description: "Kid-friendly events, library programs, hands-on activities, and all-ages fun." },
  { id: "cat-farmers-markets", name: "Farmers Markets", slug: "farmers-markets", description: "Local growers, makers, farm stands, and weekly market days." },
  { id: "cat-sports-fitness", name: "Sports & Fitness", slug: "sports-fitness", description: "Runs, rides, workouts, tournaments, classes, and active events." },
  { id: "cat-arts-culture", name: "Arts & Culture", slug: "arts-culture", description: "Gallery shows, theater, museums, workshops, author talks, and cultural programs." },
  { id: "cat-community", name: "Community", slug: "community", description: "Civic events, fundraisers, volunteer days, meetups, and local gatherings." },
  { id: "cat-nightlife", name: "Nightlife", slug: "nightlife", description: "Late-night events, bars, comedy, trivia, dancing, and social nights." },
  { id: "cat-business-networking", name: "Business & Networking", slug: "business-networking", description: "Chamber events, professional meetups, workshops, and founder gatherings." }
];

type EventSeedTuple = [
  title: string,
  citySlug: string,
  categorySlug: string,
  startDay: number,
  startHour: number,
  endHour: number,
  venueName: string,
  address: string,
  priceText: string,
  isFree: boolean,
  isFamilyFriendly: boolean,
  isFeatured: boolean
];

type EventSeed = Omit<Event, "id" | "created_at" | "updated_at" | "city_id" | "category_id"> & {
  citySlug: string;
  categorySlug: string;
};

const eventSeedTuples: EventSeedTuple[] = [
  ["Friday Night Food Truck Rally", "north-ridgeville", "food-drink", 2, 17, 21, "South Central Park", "7565 Avon Belden Rd, North Ridgeville, OH", "Free entry", true, true, true],
  ["Ridgeville Summer Concert on the Lawn", "north-ridgeville", "live-music", 3, 18, 20, "North Ridgeville Library Green", "35700 Bainbridge Rd, North Ridgeville, OH", "Free", true, true, true],
  ["Avon Local Makers Market", "avon", "farmers-markets", 3, 9, 13, "Avon Isle Park", "37080 Detroit Rd, Avon, OH", "Free", true, true, true],
  ["Crocker Park Patio Jazz", "westlake", "live-music", 4, 19, 22, "Crocker Park", "177 Market St, Westlake, OH", "Free", true, false, true],
  ["Lake Erie Nature Walk for Families", "bay-village", "family", 4, 10, 12, "Huntington Reservation", "28728 Wolf Rd, Bay Village, OH", "Free", true, true, false],
  ["Medina Square Art Stroll", "medina", "arts-culture", 5, 11, 16, "Medina Public Square", "Public Square, Medina, OH", "Free", true, true, true],
  ["Lakewood Late Night Vinyl Social", "lakewood", "nightlife", 3, 21, 23, "Mahall's Apartment", "13200 Madison Ave, Lakewood, OH", "$12", false, false, false],
  ["Cleveland Riverfront Fitness Bootcamp", "cleveland", "sports-fitness", 4, 8, 9, "Rivergate Park", "1785 Merwin Ave, Cleveland, OH", "$15", false, false, false],
  ["Strongsville Youth Soccer Skills Day", "strongsville", "sports-fitness", 5, 9, 12, "Foltz Athletic Fields", "15381 Royalton Rd, Strongsville, OH", "$10", false, true, false],
  ["Elyria Community Garden Volunteer Morning", "elyria", "community", 4, 9, 11, "East Falls Riverwalk", "Kerstetter Way, Elyria, OH", "Free", true, true, false],
  ["Avon Lake Sunset Paddle Meetup", "avon-lake", "sports-fitness", 3, 18, 20, "Miller Road Park", "33760 Lake Rd, Avon Lake, OH", "$20 rental optional", false, false, false],
  ["Cleveland Museum District Family Day", "cleveland", "family", 5, 10, 15, "University Circle", "10831 Magnolia Dr, Cleveland, OH", "Free and paid options", false, true, true],
  ["Westlake Coffee & Contacts", "westlake", "business-networking", 6, 8, 9, "Porter's Coffee House", "27333 Detroit Rd, Westlake, OH", "$8", false, false, false],
  ["Bay Village Porch Concert Series", "bay-village", "live-music", 5, 18, 20, "Cahoon Memorial Park", "27600 Lake Rd, Bay Village, OH", "Free", true, true, false],
  ["Medina Farmers Market Preview", "medina", "farmers-markets", 4, 9, 13, "Historic Medina Square", "39 Public Square, Medina, OH", "Free", true, true, true],
  ["Lakewood Taco Trail Weekend", "lakewood", "food-drink", 4, 12, 20, "Madison Avenue District", "Madison Ave, Lakewood, OH", "$5 specials", false, true, false],
  ["Elyria Summer Theater Sampler", "elyria", "arts-culture", 6, 14, 16, "Elyria Performing Arts Center", "600 West Ave, Elyria, OH", "$18", false, true, false],
  ["Avon Lake Backyard Birding Workshop", "avon-lake", "family", 6, 10, 11, "Avon Lake Public Library", "32649 Electric Blvd, Avon Lake, OH", "Free", true, true, false],
  ["Strongsville Food Truck Friday", "strongsville", "food-drink", 2, 17, 21, "Strongsville Commons", "Royalton Rd, Strongsville, OH", "Free entry", true, true, true],
  ["Cleveland Indie Film Pop-Up", "cleveland", "arts-culture", 3, 19, 22, "Gordon Square Arts District", "Detroit Ave, Cleveland, OH", "$14", false, false, false],
  ["North Ridgeville Chamber Morning Mixer", "north-ridgeville", "business-networking", 7, 8, 9, "Ranger Cafe", "Center Ridge Rd, North Ridgeville, OH", "$5", false, false, false],
  ["Avon Family Bike Parade", "avon", "community", 5, 10, 12, "Veterans Memorial Park", "3701 Veterans Memorial Pkwy, Avon, OH", "Free", true, true, false],
  ["Lakewood Comedy Night", "lakewood", "nightlife", 5, 20, 22, "The Winchester", "12112 Madison Ave, Lakewood, OH", "$16", false, false, false],
  ["Cleveland Lakefront Summer Fest", "cleveland", "festivals", 6, 12, 22, "North Coast Harbor", "E 9th St Pier, Cleveland, OH", "Free entry", true, true, true],
  ["Elyria Juneteenth Community Celebration", "elyria", "festivals", 8, 13, 19, "Cascade Park", "387 Furnace St, Elyria, OH", "Free", true, true, true]
];

const eventSeeds: EventSeed[] = eventSeedTuples.map(([title, citySlug, categorySlug, startDay, startHour, endHour, venue_name, address, price_text, is_free, is_family_friendly, is_featured]) => ({
  title,
  slug: String(title).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  description: `${title} brings neighbors together for a practical, weekend-ready local outing. Confirm details with the organizer before heading out.`,
  start_datetime: isoAfter(Number(startDay), Number(startHour)),
  end_datetime: isoAfter(Number(startDay), Number(endHour)),
  has_start_time: true,
  has_end_time: true,
  venue_name: String(venue_name),
  address: String(address),
  citySlug: String(citySlug),
  categorySlug: String(categorySlug),
  price_text: String(price_text),
  is_free: Boolean(is_free),
  is_family_friendly: Boolean(is_family_friendly),
  event_url: "https://example.com/event-source",
  organizer_name: "Local Organizer",
  organizer_email: "events@example.com",
  image_url: null,
  status: "published" as const,
  is_featured: Boolean(is_featured)
}));

export const events: Event[] = eventSeeds.map((event, index) => {
  const city = cities.find((item) => item.slug === event.citySlug);
  const category = categories.find((item) => item.slug === event.categorySlug);

  if (!city || !category) {
    throw new Error(`Missing seed relation for ${event.title}`);
  }

  const timestamp = isoAfter(-2, 9);

  return {
    id: `event-${index + 1}`,
    title: event.title,
    slug: event.slug,
    description: event.description,
    start_datetime: event.start_datetime,
    end_datetime: event.end_datetime,
    has_start_time: true,
    has_end_time: true,
    venue_name: event.venue_name,
    address: event.address,
    city_id: city.id,
    category_id: category.id,
    price_text: event.price_text,
    is_free: event.is_free,
    is_family_friendly: event.is_family_friendly,
    event_url: event.event_url,
    organizer_name: event.organizer_name,
    organizer_email: event.organizer_email,
    image_url: event.image_url,
    status: event.status,
    is_featured: event.is_featured,
    created_at: timestamp,
    updated_at: timestamp
  };
});
