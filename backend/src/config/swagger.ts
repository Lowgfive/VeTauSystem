import swaggerJSDoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const PORT = process.env.PORT || 4000;

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "VéTàu System API",
            version: "1.0.0",
            description: "API documentation cho hệ thống bán vé tàu trực tuyến",
            contact: {
                name: "VéTàu Team",
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/v1`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Nhập JWT token: Bearer {token}",
                },
            },
            schemas: {
                // ─── Common ────────────────────────────────────────────────────────────
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Error message" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
                // ─── Station ───────────────────────────────────────────────────────────
                Station: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string", example: "Ga Hà Nội" },
                        code: { type: "string", example: "HN" },
                        city: { type: "string", example: "Hà Nội" },
                    },
                },
                // ─── Schedule ──────────────────────────────────────────────────────────
                Schedule: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        trainCode: { type: "string", example: "SE1" },
                        fromStation: { $ref: "#/components/schemas/Station" },
                        toStation: { $ref: "#/components/schemas/Station" },
                        departureTime: { type: "string", format: "date-time" },
                        arrivalTime: { type: "string", format: "date-time" },
                        availableSeats: { type: "integer", example: 120 },
                    },
                },
                // ─── Booking ───────────────────────────────────────────────────────────
                Booking: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        bookingCode: { type: "string", example: "AB12CD" },
                        status: {
                            type: "string",
                            enum: ["PENDING", "PAID", "CANCELLED"],
                        },
                        totalAmount: { type: "number", example: 450000 },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
            },
        },
        tags: [
            { name: "Stations", description: "Danh sách ga tàu" },
            { name: "Schedules", description: "Lịch trình chuyến tàu" },
            { name: "Booking", description: "Đặt vé & quản lý chỗ" },
            { name: "Payment", description: "Thanh toán" },
            { name: "Auth", description: "Xác thực người dùng" },
        ],
    },
    // JSDoc comment trong các route/controller files
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
