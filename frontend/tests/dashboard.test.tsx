import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dashboard } from "../components/dashboard";
import { HomeExperience } from "../components/home-experience";
import type { SearchSession } from "../lib/types";

const session: SearchSession = {
  sessionId: "session-1",
  service: "dental cleaning",
  status: "calling",
  createdAt: new Date().toISOString(),
  businesses: [
    {
      id: "dental-1",
      name: "Bright Smile Dental",
      service: "dental cleaning",
      phone: "+1-555-0101",
      location: "San Francisco, CA",
      priceRange: "$120-$160",
      availabilityHint: "Weekday mornings",
      callStatus: "completed",
      callId: "call-1",
      error: null,
    },
    {
      id: "dental-2",
      name: "Market Street Dental Care",
      service: "dental cleaning",
      phone: "+1-555-0102",
      location: "Oakland, CA",
      priceRange: "$95-$140",
      availabilityHint: "Same-week afternoon slots",
      callStatus: "calling",
      callId: "call-2",
      error: null,
    },
  ],
  results: [
    {
      businessId: "dental-1",
      businessName: "Bright Smile Dental",
      phone: "+1-555-0101",
      status: "completed",
      price: 129,
      availability: "Tomorrow 9 AM",
      notes: "Includes exam",
      updatedAt: new Date().toISOString(),
      durationSeconds: 93,
    },
    {
      businessId: "dental-2",
      businessName: "Market Street Dental Care",
      phone: "+1-555-0102",
      status: "completed",
      price: 99,
      availability: "Friday 2 PM",
      notes: "New patient special",
      updatedAt: new Date().toISOString(),
      durationSeconds: 45,
    },
  ],
  cheapestOption: {
    businessId: "dental-2",
    businessName: "Market Street Dental Care",
    phone: "+1-555-0102",
    status: "completed",
    price: 99,
    availability: "Friday 2 PM",
    notes: "New patient special",
    updatedAt: new Date().toISOString(),
    durationSeconds: 45,
  },
};

describe("Dashboard", () => {
  it("renders system status, businesses, results, and highlights the cheapest option", () => {
    render(
      <Dashboard
        services={["dental cleaning", "oil change"]}
        selectedService="dental cleaning"
        session={session}
        onServiceChange={() => {}}
        onStartSearch={() => {}}
        isStarting={false}
      />,
    );

    expect(screen.getByText(/Search in progress/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^calling$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bright Smile Dental/i)).toHaveLength(2);
    expect(screen.getAllByText(/Market Street Dental Care/i)).toHaveLength(2);
    expect(screen.getByText(/\$99/)).toBeInTheDocument();
    expect(screen.getByText(/best current option/i)).toBeInTheDocument();
    expect(screen.getAllByText(/last completed conversation/i).length).toBeGreaterThan(0);
  });

  it("parses a natural-language request and transitions into the live dashboard", async () => {
    const onStartFromPrompt = vi.fn(async () => session);

    render(<HomeExperience services={["dental cleaning", "oil change"]} onStartFromPrompt={onStartFromPrompt} />);

    fireEvent.change(screen.getByPlaceholderText(/tell genie what you need/i), {
      target: { value: "Find me the cheapest dental cleaning tomorrow morning" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit genie request/i }));

    await waitFor(() => {
      expect(onStartFromPrompt).toHaveBeenCalledWith(
        "Find me the cheapest dental cleaning tomorrow morning",
        "dental cleaning",
      );
    });

    expect(screen.getAllByText(/^calling$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/collected results/i).length).toBeGreaterThan(0);
  });

  it("triggers stop all calls for the active session", async () => {
    const onStopSearch = vi.fn();

    cleanup();

    render(
      <Dashboard
        services={["dental cleaning", "oil change"]}
        selectedService="dental cleaning"
        session={session}
        onServiceChange={() => {}}
        onStartSearch={() => {}}
        onStopSearch={onStopSearch}
        isStarting={false}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /stop all calls/i })[0]);

    await waitFor(() => {
      expect(onStopSearch).toHaveBeenCalledWith("session-1");
    });
  });

  it("opens a business detail drawer when a business card is selected", async () => {
    render(
      <Dashboard
        services={["dental cleaning", "oil change"]}
        selectedService="dental cleaning"
        session={session}
        onServiceChange={() => {}}
        onStartSearch={() => {}}
        isStarting={false}
      />,
    );

    fireEvent.click(screen.getAllByText(/Bright Smile Dental/i)[0]);

    expect(screen.getAllByText(/conversation details/i).length).toBeGreaterThan(0);
    expect(screen.getByText("call-1")).toBeInTheDocument();
    expect(screen.getByText(/no transcript yet/i)).toBeInTheDocument();
  });
});
