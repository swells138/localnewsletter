export type EventStatus = "draft" | "pending" | "published" | "rejected";

export type City = {
  id: string;
  name: string;
  slug: string;
  county: string;
  state: string;
  latitude: number;
  longitude: number;
  seo_title: string;
  seo_description: string;
  intro_text: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  venue_name: string;
  address: string;
  city_id: string;
  category_id: string;
  price_text: string;
  is_free: boolean;
  is_family_friendly: boolean;
  event_url: string;
  organizer_name: string;
  organizer_email: string;
  image_url: string | null;
  status: EventStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type EventWithRelations = Event & {
  city: City;
  category: Category;
};

export type EventFilters = {
  city?: string;
  category?: string;
  date?: string;
  free?: boolean;
  family?: boolean;
  q?: string;
};
