import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import ApartmentCard, { ApartmentProps } from "./ApartmentCard";
import { LanguageProvider } from "@/contexts/LanguageContext";

const mockApartment: ApartmentProps = {
  id: "test-apt",
  name: "Ocean Suite",
  description: "A stunning ocean-view suite.",
  price: 200,
  capacity: 2,
  size: 60,
  image: "/test-image.jpg",
  location: "Beachfront",
  features: ["Wi-Fi", "Kitchen", "Bathroom"],
};

function renderCard(apartment = mockApartment) {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <ApartmentCard apartment={apartment} />
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe("ApartmentCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the apartment name", () => {
    renderCard();
    expect(screen.getByText("Ocean Suite")).toBeInTheDocument();
  });

  it("renders the apartment location", () => {
    renderCard();
    expect(screen.getByText("Beachfront")).toBeInTheDocument();
  });

  it("renders the apartment price", () => {
    renderCard();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it("renders the apartment size", () => {
    renderCard();
    expect(screen.getByText("60 m²")).toBeInTheDocument();
  });

  it("renders the apartment description", () => {
    renderCard();
    expect(screen.getByText("A stunning ocean-view suite.")).toBeInTheDocument();
  });

  it("renders up to 3 features", () => {
    renderCard();
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Bathroom")).toBeInTheDocument();
  });

  it("does not show '+N more' when features count is 3 or fewer", () => {
    renderCard();
    expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
  });

  it("shows '+N more' label when features exceed 3", () => {
    const apt = { ...mockApartment, features: ["Wi-Fi", "Kitchen", "Bathroom", "Pool", "Gym"] };
    renderCard(apt);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("renders a 'View Details' link pointing to the apartment page", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/apartments/test-apt");
  });

  it("renders the apartment image with alt text from the name", () => {
    renderCard();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Ocean Suite");
    expect(img).toHaveAttribute("src", "/test-image.jpg");
  });

  it("shows the capacity with guest label", () => {
    renderCard();
    expect(screen.getByText("2 Guests")).toBeInTheDocument();
  });
});
