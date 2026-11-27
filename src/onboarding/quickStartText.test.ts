import { QUICK_START_PLAN } from "./quickStartPlan";
import { quickStartDefaultRows, quickStartPlanRows } from "./quickStartText";

describe("quick start text", () => {
  it("lists the four defaults in order", () => {
    expect(quickStartDefaultRows()).toEqual([
      { label: "Goal", value: "Stay fit and healthy" },
      { label: "Experience", value: "Just starting" },
      { label: "Schedule", value: "3 days · Mon, Wed, Fri" },
      { label: "Equipment", value: "Full gym" },
    ]);
  });

  it("builds the plan rows from the plan: days, name, real exercise names and the count", () => {
    const rows = quickStartPlanRows();
    expect(rows).toHaveLength(QUICK_START_PLAN.length);
    expect(rows[0]).toEqual({
      days: "Mon, Fri",
      name: "Full body A",
      subtitle: `${QUICK_START_PLAN[0].exercises.join(", ")} · 4 exercises`,
    });
    expect(rows[1].days).toBe("Wed");
    expect(rows[1].subtitle.endsWith(" · 4 exercises")).toBe(true);
  });
});
