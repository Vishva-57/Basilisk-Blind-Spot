import { runAudit } from "./src/lib/audit/runAudit";

async function main() {
  try {
    console.log("Running audit for https://tvkvijay.com/en ...");
    const result = await runAudit("https://tvkvijay.com/en");
    console.log("Success! Found", result.axeResults.violations.length, "violations.");
  } catch (err) {
    console.error("Failed with error:", err);
  }
}

main();
