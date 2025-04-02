import { Queue, Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { sendEmail } from "../utils/email.js";

// Queue for adding jobs
export const notificationEmailQueue = new Queue("notification-email", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    // Add rate limiting delay for Resend (2 requests per second = 500ms between jobs)
    limiter: {
      max: 1,
      duration: 500,
    },
  },
});

// Create a worker to process email jobs
const worker = new Worker(
  "notification-email",
  async (job) => {
    try {
      const { subject, to, html } = job.data;
      console.log(`Processing email job ${job.id} to: ${to}`);
      
      // Ensure data is properly formatted as strings
      const safeSubject = String(subject || "");
      const safeTo = String(to || "");
      const safeHtml = String(html || "");
      
      if (!safeTo) {
        throw new Error("Email recipient is required");
      }
      
      await sendEmail({ 
        subject: safeSubject, 
        to: safeTo, 
        html: safeHtml 
      });
      
      return { success: true, to: safeTo };
    } catch (error) {
      console.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Limit concurrent processing to 2 at a time
    limiter: {
      max: 2, // Process at most 2 jobs per second
      duration: 1000,
    },
  }
);

// Handle worker events
worker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`Email job ${job.id} failed:`, error);
});

// Simplified graceful shutdown function
export const shutdownEmailQueue = async () => {
  try {
    await worker.close();
    await notificationEmailQueue.close();
    return true;
  } catch (error) {
    console.error("Email queue shutdown error:", error);
    return false;
  }
};

export default notificationEmailQueue;
