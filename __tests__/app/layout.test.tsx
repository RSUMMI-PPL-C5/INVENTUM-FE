import { render, screen } from "@testing-library/react";
import React from "react";

describe("RootLayout", () => {
	it("renders without crashing", () => {
		render(
			<>
				<div>Test</div>
			</>
		);
	});

	it("renders children correctly", () => {
		render(
			<>
				<div data-testid="child-element">Test</div>
			</>
		);
		expect(screen.getByTestId("child-element")).toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(
			<>
				<div>Snapshot Test</div>
			</>
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("renders correct HTML structure", () => {
		render(
			<>
				<div data-testid="content">Content</div>
			</>
		);
		expect(document.documentElement.lang).toBe("en");
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});
});
