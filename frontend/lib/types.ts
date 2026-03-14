export type Business = {
  id: string;
  name: string;
  service: string;
  phone: string;
  location: string;
  priceRange: string;
  availabilityHint: string;
  callStatus: string;
  callId: string | null;
  error: string | null;
};

export type CallResult = {
  businessId: string;
  businessName: string;
  phone: string;
  status: string;
  price: number | null;
  availability: string;
  notes: string;
  updatedAt: string;
};

export type SearchSession = {
  sessionId: string;
  service: string;
  status: string;
  createdAt: string;
  businesses: Business[];
  results: CallResult[];
  cheapestOption: CallResult | null;
};

export type ResultsResponse = {
  sessions: SearchSession[];
};

