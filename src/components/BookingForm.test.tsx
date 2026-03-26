import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import BookingForm from "./BookingForm";
import { LanguageProvider } from "@/contexts/LanguageContext";

function renderForm() {
  return render(
    <LanguageProvider>
      <BookingForm />
    </LanguageProvider>
  );
}

describe("BookingForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the form title", () => {
    renderForm();
    expect(screen.getByText("Book Your Stay")).toBeInTheDocument();
  });

  it("renders the Check-in Date label", () => {
    renderForm();
    expect(screen.getByText("Check-in Date")).toBeInTheDocument();
  });

  it("renders the Check-out Date label", () => {
    renderForm();
    expect(screen.getByText("Check-out Date")).toBeInTheDocument();
  });

  it("renders the Adults label", () => {
    renderForm();
    expect(screen.getByText("Adults")).toBeInTheDocument();
  });

  it("renders the Children label", () => {
    renderForm();
    expect(screen.getByText("Children")).toBeInTheDocument();
  });

  it("renders the submit button with 'Check Availability' text initially", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /check availability/i })).toBeInTheDocument();
  });

  it("shows 'Booking Confirmed!' after form submission", () => {
    renderForm();
    const submitButton = screen.getByRole("button", { name: /check availability/i });
    fireEvent.click(submitButton);
    // setSubmitted(true) fires synchronously inside the event handler
    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
  });

  it("reverts to 'Check Availability' after 3 seconds", () => {
    renderForm();
    const submitButton = screen.getByRole("button", { name: /check availability/i });
    fireEvent.click(submitButton);
    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("button", { name: /check availability/i })).toBeInTheDocument();
  });

  it("renders 'Select date' placeholders for date pickers", () => {
    renderForm();
    const placeholders = screen.getAllByText("Select date");
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
  });
});
