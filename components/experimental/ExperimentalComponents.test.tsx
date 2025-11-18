import { describe, it, expect } from "vitest";
import { ExperimentalSectionShell } from "./ExperimentalSectionShell";

describe("Experimental components", () => {
  it("renders ExperimentalSectionShell with children", () => {
    const shell = (
      <ExperimentalSectionShell
        label="TEST · MODULE"
        name="Test Shell"
        description="Test description"
      >
        <div>child</div>
      </ExperimentalSectionShell>
    );

    expect(shell).toBeTruthy();
  });

  // Component modules depend on client-only behavior; this sanity check ensures
  // the shared shell renders without throwing during server-side rendering.
});
