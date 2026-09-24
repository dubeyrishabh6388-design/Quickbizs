import { globalSearchService } from "./services/globalSearchService";

async function run() {
  try {
    const res1 = await globalSearchService.executeSearch(
      "fresh-choice",
      "owner-user-id",
      "Owner",
      "Amul Paneer"
    );
    console.log("EXECUTE SEARCH RESULT ('Amul Paneer'):", JSON.stringify(res1, null, 2));

    const res2 = await globalSearchService.executeSearch(
      "fresh-choice",
      "owner-user-id",
      "Owner",
      "amul paneer"
    );
    console.log("EXECUTE SEARCH RESULT ('amul paneer'):", JSON.stringify(res2, null, 2));
  } catch (err) {
    console.error("DIAGNOSTICS SERVICE ERROR:", err);
  }
}

run();
