Simple_E_Commerce/
├── admin-panel/
│   ├── .gitignore
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── TODO.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── App.css
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── charts/
│       │   ├── common/
│       │   ├── layout/
│       │   │   └── DashboardLayout.tsx
│       │   └── ui/
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       └── label.tsx
│       ├── hooks/
│       ├── pages/
│       │   ├── auth/
|       |   |   └── Login.tsx
│       │   ├── brands/
|       |   |   └── BrandList.tsx
│       │   ├── categories/
|       |   |   └── CategoryList.tsx
│       │   ├── customers/
|       |   |   ├── CategoryDetails.tsx
|       |   |   └── CustomerList.tsx
│       │   ├── dashboard/
|       |   |   └── Dashboard.tsx
│       │   ├── orders/
|       |   |   ├── OrderDetails.tsx
|       |   |   └── OrderList.tsx
│       │   ├── products/
|       |   |   ├── ProductCreate.tsx
|       |   |   ├── ProductDetails.tsx
|       |   |   └── ProductList.tsx
│       │   └── settings/
|       |   |   └── Settings.tsx
│       ├── services/
│       │   └── api.ts
│       ├── store/
│       │   └── authStore.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── index.ts
├── backend/
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── config/
│       │   ├── cloudinary.ts
│       │   ├── database.ts
│       │   └── email.ts
│       ├── controllers/
│       │   ├── adminAuthController.ts
│       │   ├── adminOrderController.ts
│       │   ├── authController.ts
│       │   ├── brandController.ts
│       │   ├── cartController.ts
│       │   ├── categoryController.ts
│       │   ├── orderController.ts
│       │   ├── productController.ts
│       │   ├── uploadController.ts
│       │   └── userController.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts
│       │   ├── errorHandler.ts
│       │   ├── uploadMiddleware.ts
│       │   └── validation.ts
│       ├── models/
│       │   ├── Admin.ts
│       │   ├── Brand.ts
│       │   ├── Cart.ts
│       │   ├── Category.ts
│       │   ├── Order.ts
│       │   ├── Product.ts
│       │   └── User.ts
│       ├── routes/
│       │   ├── adminAuthRoutes.ts
│       │   ├── adminOrderRoutes.ts
│       │   ├── authRoutes.ts
│       │   ├── brandRoutes.ts
│       │   ├── cartRoutes.ts
│       │   ├── categoryRoutes.ts
│       │   ├── orderRoutes.ts
│       │   ├── productRoutes.ts
│       │   ├── uploadRoutes.ts
│       │   └── userRoutes.ts
│       ├── scripts/
│       │   └── seedAdmin.ts
│       ├── types/
│       │   ├── index.ts
│       │   └── multer-storage-cloudinary.d.ts
│       └── utils/
│           ├── generateToken.ts
│           └── sendEmail.ts
└── customer-frontend/
    ├── .eslintrc.json
    ├── .gitignore
    ├── .env
    ├── components.json
    ├── next.config.js
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── public/
    │   ├── icons/
    │   └── images/
    └── src/
        ├── i18n.ts
        ├── middleware.ts
        ├── app/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── [locale]/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx
        │   │   ├── (auth)/
        │   │   │   ├── forgot-password/
        │   │   │   │   └── page.tsx
        │   │   │   ├── login/
        │   │   │   │   └── page.tsx
        │   │   │   └── register/
        │   │   │       └── page.tsx
        │   │   └── (shop)/
        │   │       ├── layout.tsx
        │   │       ├── account/
        │   │       │   ├── orders/
        │   │       │   │   └── page.tsx
        │   │       │   └── page.tsx
        │   │       ├── cart/
        │   │       │   └── page.tsx
        │   │       ├── checkout/
        │   │       │   └── page.tsx
        │   │       ├── home/
        │   │       │   └── page.tsx
        │   │       ├── products/
        │   │       │   └── [slug]/
        │   │       └── products/
        │   │           └── page.tsx
        │   └── api/
        ├── components/
        │   ├── account/
        |   │   └── AddressDialog.tsx
        │   ├── cart/
        │   ├── common/
        │   ├── home/
        │   |   ├── HeroSection.tsx
        │   |   ├── FeaturedProducts.tsx
        │   |   └── CategoriesGrid.tsx
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   └── Footer.tsx
        │   ├── products/
        │   │   ├── ProductCard.tsx
        │   │   └── ProductFilters.tsx
        │   └── ui/
        │       ├── Button.tsx
        │       ├── Skeleton.tsx
        │       ├── toast.tsx
        │       ├── avatar.tsx
        │       ├── ...other shadcn components
        ├── hooks/
        │   ├── use-toast.ts
        │   ├── useAuth.ts
        │   ├── useCart.ts
        │   └── useProducts.ts
        ├── lib/
        │   ├── api.ts
        │   ├── types.ts
        │   └── utils.ts
        ├── messages/
        │   ├── ar.json
        │   ├── en.json
        │   └── fr.json
        └── store/
            ├── authStore.ts
            ├── cartStore.ts
            └── index.ts
