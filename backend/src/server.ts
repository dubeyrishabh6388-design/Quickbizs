import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { env } from "./config/environment";
import { prisma } from "./config/prisma";
import { logger } from "./utils/logger";
import { NotificationGateway } from "./gateways/notificationGateway";
import { NotificationScheduler } from "./schedulers/notificationScheduler";
import { CustomerReminderScheduler } from "./services/customerReminderScheduler";
import { PaymentScheduler } from "./services/paymentScheduler";

const startServer = async () => {
  try {
    logger.info("Initializing relational database ledger connection...");
    
    // Connect to database to verify credential validity
    await prisma.$connect();
    logger.info("Database connection to WAMP MySQL established successfully.");

    // Create HTTP wrapper for Socket.IO support
    const server = http.createServer(app);
    
    const io = new Server(server, {
      cors: {
        origin: [env.frontendUrl, "http://localhost:5173", "https://quickbizs.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    // Initialize Gateway and schedulers
    NotificationGateway.initialize(io);
    NotificationScheduler.start();
    CustomerReminderScheduler.start();
    PaymentScheduler.initialize();

    server.listen(env.port, () => {
      logger.info(`QuickBizs Backend Service initialized in [${env.nodeEnv}] mode.`);
      logger.info(`Server is running at http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error("Relational database connection check failed on boot sequence:", error);
    process.exit(1);
  }
};

startServer();
