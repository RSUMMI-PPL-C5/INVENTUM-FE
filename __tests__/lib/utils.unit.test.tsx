import { cn, formatNumberWithDots, formatDate, formatCurrency, decodeToken } from "@/lib/utils";

describe("cn", () => {
  test("combines multiple class names", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  test("handles conditional classes", () => {
    const condition = true;
    const result = cn("base", condition ? "active" : "inactive");
    expect(result).toBe("base active");
  });

  test("handles array of classes", () => {
    const result = cn("base", ["one", "two"]);
    expect(result).toBe("base one two");
  });

  test("handles undefined or null values", () => {
    const result = cn("base", undefined, null);
    expect(result).toBe("base");
  });
  test("removes duplicates and merges tailwind classes", () => {
    // When two utility classes in the same category are provided,
    // tailwind-merge keeps the last one (in this case px-4 and text-blue-400)
    const result = cn("px-2 text-red-500", "px-4 text-blue-400");
    expect(result).toBe("px-4 text-blue-400");
  });

  test("preserves non-conflicting tailwind classes", () => {
    const result = cn("px-2 font-bold", "py-4 text-blue-400");
    expect(result).toBe("px-2 font-bold py-4 text-blue-400");
  });
});

describe("formatNumberWithDots", () => {
  test("formats number with thousand separators", () => {
    expect(formatNumberWithDots("1000")).toBe("1.000");
    expect(formatNumberWithDots("1000000")).toBe("1.000.000");
  });

  test("handles already formatted strings", () => {
    expect(formatNumberWithDots("1.000.000")).toBe("1.000.000");
  });

  test("handles empty strings", () => {
    expect(formatNumberWithDots("")).toBe("");
  });

  test("handles different number lengths", () => {
    expect(formatNumberWithDots("100")).toBe("100");
    expect(formatNumberWithDots("1000")).toBe("1.000");
    expect(formatNumberWithDots("1234567")).toBe("1.234.567");
  });
});

describe("formatDate", () => {
  const originalDateTimeFormat = Intl.DateTimeFormat;
  
  beforeAll(() => {
    // Mock the DateTimeFormat for consistent testing
    (global.Intl.DateTimeFormat as any) = jest.fn().mockImplementation((locale, options) => {
      return {
        format: () => {
          if (locale === "id-ID") {
            return "31 Des 2023";
          }
          return "default format";
        }
      };
    });
  });

  afterAll(() => {
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });

  test("formats date in Indonesian format", () => {
    const result = formatDate("2023-12-31");
    expect(result).toBe("31 Des 2023");
    expect(Intl.DateTimeFormat).toHaveBeenCalledWith("id-ID", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  });

  test("returns dash for null value", () => {
    const result = formatDate(null);
    expect(result).toBe("-");
  });
});

describe("formatCurrency", () => {
  const originalNumberFormat = Intl.NumberFormat;
  
  beforeAll(() => {
    // Mock NumberFormat for consistent testing
    (global.Intl.NumberFormat as any) = jest.fn().mockImplementation((locale, options) => {
      return {
        format: (value: number) => {
          if (locale === "id-ID" && options?.currency === "IDR") {
            if (value === 1000) return "Rp 1.000";
            if (value === -500) return "-Rp 500";
            if (value === 0) return "Rp 0";
            if (value === 1000000) return "Rp 1.000.000";
          }
          return "default format";
        }
      };
    });
  });

  afterAll(() => {
    global.Intl.NumberFormat = originalNumberFormat;
  });

  test("formats positive numbers as IDR currency", () => {
    const result = formatCurrency(1000);
    expect(result).toBe("Rp 1.000");
    expect(Intl.NumberFormat).toHaveBeenCalledWith("id-ID", { 
      style: "currency", 
      currency: "IDR" 
    });
  });

  test("formats negative numbers as IDR currency", () => {
    const result = formatCurrency(-500);
    expect(result).toBe("-Rp 500");
  });

  test("formats zero as IDR currency", () => {
    const result = formatCurrency(0);
    expect(result).toBe("Rp 0");
  });

  test("formats large numbers as IDR currency", () => {
    const result = formatCurrency(1000000);
    expect(result).toBe("Rp 1.000.000");
  });

  test("returns dash for null value", () => {
    const result = formatCurrency(null);
    expect(result).toBe("-");
  });
});

describe("decodeToken", () => {
  test("decodes a valid token", () => {
    const validToken = "header." + 
      btoa(JSON.stringify({ sub: "123", name: "Test User" })) + 
      ".signature";

    const result = decodeToken(validToken);

    expect(result).toEqual({ sub: "123", name: "Test User" });
  });

  test("returns null for a token with invalid format", () => {
    const invalidToken = "invalid-token";

    const result = decodeToken(invalidToken);

    expect(result).toBeNull();
  });

  test("returns null for an empty token", () => {
    const result = decodeToken("");

    expect(result).toBeNull();
  });

  test("returns null for a token with invalid base64 payload", () => {
    const invalidBase64Token = "header.invalid_base64.signature";

    const result = decodeToken(invalidBase64Token);

    expect(result).toBeNull();
  });

  test("logs an error for invalid token format", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const invalidToken = "invalid-token";

    decodeToken(invalidToken);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error decoding token:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});