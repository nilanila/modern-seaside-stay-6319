import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function TestConsumer() {
  const { language, t, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="nav-home">{t.nav.home}</span>
      <button onClick={() => setLanguage("it")}>Switch to Italian</button>
      <button onClick={() => setLanguage("en")}>Switch to English</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English when no saved language exists", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId("language").textContent).toBe("en");
    expect(screen.getByTestId("nav-home").textContent).toBe("Home");
  });

  it("loads saved language from localStorage on mount", () => {
    localStorage.setItem("language", "it");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId("language").textContent).toBe("it");
  });

  it("switches language and updates translations", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByText("Switch to Italian").click();
    });
    expect(screen.getByTestId("language").textContent).toBe("it");
  });

  it("persists language change to localStorage", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByText("Switch to Italian").click();
    });
    expect(localStorage.getItem("language")).toBe("it");
  });

  it("switches back from Italian to English", () => {
    localStorage.setItem("language", "it");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByText("Switch to English").click();
    });
    expect(screen.getByTestId("language").textContent).toBe("en");
    expect(localStorage.getItem("language")).toBe("en");
  });

  it("ignores an unsupported language code", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    // Directly call setLanguage with an unsupported code via renderHook
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });
    act(() => {
      result.current.setLanguage("fr"); // not supported
    });
    expect(result.current.language).toBe("en");
  });
});

describe("useLanguage outside provider", () => {
  it("throws an error when used outside LanguageProvider", () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() =>
      renderHook(() => useLanguage())
    ).toThrow("useLanguage must be used within a LanguageProvider");
    console.error = consoleError;
  });
});
