import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";
import React from "react";

describe("RootLayout", () => {
	it("renders without crashing", () => {
		render(
			<RootLayout>
				<div>Test</div>
			</RootLayout>
		);
	});

	it("renders children correctly", () => {
		render(
			<RootLayout>
				<div data-testid="child-element">Test</div>
			</RootLayout>
		);
		expect(screen.getByTestId("child-element")).toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(
			<RootLayout>
				<div>Snapshot Test</div>
			</RootLayout>
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("renders correct HTML structure", () => {
		render(
			<RootLayout>
				<div data-testid="content">Content</div>
			</RootLayout>
		);
		expect(document.documentElement.lang).toBe("en");
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("includes metadata correctly", () => {
		expect(metadata).toBeDefined();
		expect(metadata.title).toBe("INVENTUM");
		expect(metadata.description).toBe("Inventori Terpadu RS UMMI");
	});
});
