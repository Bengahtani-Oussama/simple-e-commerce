import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Algeria E-Commerce API',
      version: '1.0.0',
      description: 'Complete API documentation for Algeria E-Commerce platform',
      contact: {
        name: 'Support',
        email: 'support@ecommerce.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      },
      {
        url: 'https://api.ecommerce.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token required for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User unique identifier' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', format: 'password' },
            addresses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  type: { type: 'string', enum: ['home', 'work', 'other'] },
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' },
                  isDefault: { type: 'boolean' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: {
              type: "object",
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' },
                fr: { type: 'string' }
              }
            },
            description: {
              type: "object",
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' },
                fr: { type: 'string' }
              }
            },
            price: { type: 'number' },
            category: { type: 'string' },
            brand: { type: 'string' },
            image: { type: 'string' },
            stock: { type: 'number' },
            variants: {
              type: 'array',
              items: { type: 'object' }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            user: { type: 'string' },
            items: { type: 'array' },
            subtotal: { type: 'number' },
            shippingCost: { type: 'number' },
            total: { type: 'number' },
            orderStatus: { type: 'string' },
            paymentStatus: { type: 'string' },
            paymentMethod: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Brand: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            logo: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Coupon: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string' },
            discountPercentage: { type: 'number' },
            maxUses: { type: 'number' },
            usedCount: { type: 'number' },
            expiryDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'number' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts'
  ]
};

export const specs = swaggerJsdoc(options);
