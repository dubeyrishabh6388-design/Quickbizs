import { prisma } from "../src/config/prisma";
import { BUSINESS_TEMPLATES } from "../src/config/templates";

async function main() {
  console.log("Seeding business categories and templates...");

  for (const [key, value] of Object.entries(BUSINESS_TEMPLATES)) {
    const category = await prisma.businessCategory.upsert({
      where: { name: key },
      update: {},
      create: {
        name: key,
        description: `Default configuration template for ${key} profiles.`
      }
    });

    await prisma.businessTemplate.deleteMany({
      where: { categoryId: category.id }
    });

    await prisma.businessTemplate.create({
      data: {
        categoryId: category.id,
        name: key,
        enabledModules: JSON.stringify(value.enabledModules),
        defaultCategories: JSON.stringify(value.defaultCategories),
        dashboardWidgets: JSON.stringify(value.dashboardWidgets),
        customAttributes: JSON.stringify(value.customAttributes || []),
      }
    });
  }

  console.log("Seeding complete! Onboarding configurations loaded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
