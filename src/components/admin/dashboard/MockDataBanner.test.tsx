import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockDataBanner } from "./MockDataBanner";
import { AlertsPanel } from "./AlertsPanel";
import { RecentUsage } from "./RecentUsage";

describe("MockDataBanner", () => {
  it("should render the banner with accessible role and live region", () => {
    render(<MockDataBanner />);

    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent(
      "Dados de exemplo — não usar para decisão operacional",
    );
  });
});

describe("MockDataBanner integration", () => {
  it("should render the banner at the top of AlertsPanel", () => {
    render(<AlertsPanel />);
    expect(screen.getByTestId("mock-data-banner")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Dados de exemplo — não usar para decisão operacional",
    );
  });

  it("should render the banner at the top of RecentUsage", () => {
    render(<RecentUsage />);
    expect(screen.getByTestId("mock-data-banner")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Dados de exemplo — não usar para decisão operacional",
    );
  });
});
