import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import connectDatabase from "./config/database";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { specs } from "./config/swagger";

// Import routes
import authRoutes from "./routes/authRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import userRoutes from "./routes/userRoutes";
import adminUserRoutes from "./routes/adminUserRoutes";
import couponRoutes from "./routes/couponRoutes";
import staffRoutes from "./routes/staffRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import { scheduleAutoCleanup } from "./utils/sectionCleanup";
import adminPreferencesRoutes from './routes/adminPreferencesRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to database
connectDatabase();

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3001",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve);
app.get(
  "/api-docs",
  swaggerUi.setup(specs, {
    swaggerOptions: {
      url: "/api-docs/swagger.json",
      persistAuthorization: true,
    },
  }),
);

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Algeria E-Commerce API",
    version: "1.0.0",
    documentation: "http://localhost:5000/api-docs",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/customers", adminUserRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/sections", sectionRoutes);
app.use('/api/admin/preferences', adminPreferencesRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );

  // Schedule automatic section cleanup (runs every 24 hours)
  // scheduleAutoCleanup(24);
});

export default app;
