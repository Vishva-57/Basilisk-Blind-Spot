import { runAudit } from "./src/lib/audit/runAudit";

async function main() {
  try {
    console.log("Running audit for w3.org...");
    const result = await runAudit("https://www.w3.org");
    console.log("Success! Found", result.axeResults.violations.length, "violations.");
  } catch (err) {
    console.error("Failed with error:", err);
    if (err instanceof Error) {
        console.error("Stack:", err.stack);
    }
  }
}

main();
