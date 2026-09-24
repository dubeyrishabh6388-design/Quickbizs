import { prisma } from "./config/prisma";

async function findBiz() {
  const user = await prisma.user.findFirst({
    where: { email: "owner@quickbizs.com" },
    include: { business: true }
  });
  console.log("USER:", user);
  if (user && user.business) {
    console.log("BUSINESS ID:", user.business.id);
    console.log("BUSINESS NAME:", user.business.name);
  } else {
    // If not found, check businesses directly
    const biz = await prisma.business.findFirst({
      where: { email: "owner@quickbizs.com" }
    });
    console.log("DIRECT BIZ SEARCH:", biz);
  }
}

findBiz();
