This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Setup

Copy `.env.local` to `.env` (required for Prisma):
```bash
cp .env.local .env
```

Configure the following environment variables in both files:

**Database (Supabase):**
- `DATABASE_URL` - Connection pooling URL (port 6543)
- `DIRECT_URL` - Direct connection URL (port 5432)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**APIs:**
- `SEGMIND_API_KEY` - Segmind face-swap API key
- `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` - Wompi public key
- `WOMPI_PRIVATE_KEY` - Wompi private key
- `WOMPI_EVENTS_SECRET` - Wompi webhook secret
- `RESEND_API_KEY` - Email service API key

**App:**
- `NEXT_PUBLIC_APP_URL` - Application URL (http://localhost:3000 for dev)
- `ADMIN_PASSWORD` - Admin panel password

### 2. Database Setup

Push schema to database:
```bash
npx prisma db push
```

Seed with test data:
```bash
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## QA Testing Checklist

Before deploying to production, complete the following QA tests based on implemented features (Checkpoints 1-9).

### 1. Database & Setup (Checkpoint 1-2)
- [ ] Database schema created successfully with `npx prisma db push`
- [ ] Seed script runs without errors (`npm run db:seed`)
- [ ] Verify 4 tables exist: `stories`, `story_pages`, `orders`, `generated_books`
- [ ] Verify test stories appear in database

### 2. Admin Panel - Story Management (Checkpoint 3)
**Access:** `/admin/login` (password: from `ADMIN_PASSWORD` env var)

- [ ] Admin login works with correct password
- [ ] Admin login rejects incorrect password
- [ ] Story listing page loads (`/admin/stories`)
- [ ] Can create new story with title, description, price
- [ ] Can upload cover image (URL-based)
- [ ] Can add pages to story with image templates and text templates
- [ ] Text templates support `{child_name}` placeholder
- [ ] Can publish/unpublish stories
- [ ] Can preview story before publishing
- [ ] Can edit existing stories
- [ ] Can delete stories

### 3. Public Storefront (Checkpoint 4)
**Access:** `/` (homepage)

- [ ] Landing page loads with hero section
- [ ] "How It Works" section displays correctly
- [ ] FAQ section is functional
- [ ] Story catalog page shows all published stories (`/stories`)
- [ ] Story detail page loads (`/stories/[slug]`)
- [ ] Story preview carousel works
- [ ] Navigation menu works on desktop
- [ ] Mobile navigation (hamburger menu) works
- [ ] Footer displays with legal links
- [ ] All pages are responsive on mobile/tablet/desktop

### 4. Personalization Flow (Checkpoint 5)
**Start from:** Story detail page → "Personalizar Cuento" button

- [ ] Personalization wizard/stepper displays correctly
- [ ] Step 1: Child name input accepts valid names
- [ ] Step 1: Child name validation works (min/max length)
- [ ] Step 2: Child age selector works (dropdown or input)
- [ ] Step 3: Photo upload component accepts images
- [ ] Photo validation rejects files over size limit
- [ ] Photo validation rejects non-image files (PDF, etc.)
- [ ] Photo preview displays uploaded image
- [ ] Can navigate back/forward through wizard steps
- [ ] Order summary shows all personalization details
- [ ] "Proceed to checkout" button works

### 5. Face-Swap Processing (Checkpoint 6)
**Admin Access:** `/admin/test/faceswap` (comparison page)

- [ ] Test face-swap v3 vs v4 on admin comparison page
- [ ] Choose preferred version (v3 or v4) for production
- [ ] Test with high-quality face photo (good lighting, front-facing)
- [ ] Test with low-quality photo (verify graceful error handling)
- [ ] Test with photo containing no face (should show error)
- [ ] Test with photo containing multiple faces (verify behavior)
- [ ] Verify face detection validation works before processing
- [ ] Verify processing progress indicator displays
- [ ] Verify error messages display clearly
- [ ] Test Replicate fallback (if Segmind fails)

### 6. PDF Generation (Checkpoint 7)
**Access:** Admin order detail page → "Descargar PDF" button

- [ ] PDF generates successfully for completed order
- [ ] Cover page includes child's name
- [ ] Story pages include face-swapped images
- [ ] Text personalization works (`{child_name}` replaced)
- [ ] Back cover generates correctly
- [ ] PDF layout matches design specifications
- [ ] PDF is high-resolution (suitable for print)
- [ ] PDF downloads correctly
- [ ] Test PDF generation with different story lengths (short/long)

### 7. Payment Integration - Wompi (Checkpoint 8)
**Access:** Checkout page after personalization

**Note:** Use Wompi sandbox test credentials for testing.

#### 7.1 Credit/Debit Card Payment
- [ ] Wompi payment widget loads correctly
- [ ] Can select "Tarjeta de crédito/débito" option
- [ ] Test successful payment with test card:
  - Card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVV: Any 3 digits
- [ ] Order status updates to "APPROVED" after successful payment
- [ ] Test declined payment (use Wompi test declined card)
- [ ] Order status shows "DECLINED" for failed payment
- [ ] Payment error messages display clearly

#### 7.2 PSE (Bank Transfer)
- [ ] Can select PSE payment option
- [ ] Bank selection dropdown displays
- [ ] Test PSE flow with sandbox test bank
- [ ] Redirect to bank simulation works
- [ ] Successful PSE payment updates order to "APPROVED"
- [ ] Failed PSE payment shows error

#### 7.3 Nequi Payment
- [ ] Can select Nequi payment option
- [ ] Nequi phone number input displays
- [ ] Test Nequi payment in sandbox mode
- [ ] Order status updates correctly

#### 7.4 Webhook Handling
- [ ] Wompi webhook endpoint receives events (`/api/webhooks/wompi`)
- [ ] Webhook validates signature correctly
- [ ] Webhook updates order status based on transaction status
- [ ] Test all webhook event types:
  - `transaction.updated` (APPROVED)
  - `transaction.updated` (DECLINED)
  - `transaction.updated` (VOIDED)

#### 7.5 Order Confirmation
- [ ] Order confirmation page loads after payment (`/orders/[orderId]/confirmation`)
- [ ] Confirmation email sent to customer
- [ ] Email contains order details (child name, story title, order ID)
- [ ] Email includes order tracking link

### 8. Order Management (Checkpoint 9)

#### 8.1 Customer Order Tracking
**Access:** `/orders/[orderId]/status`

- [ ] Order status page loads with order ID
- [ ] Shows current order status (PENDING, PROCESSING, COMPLETED)
- [ ] Shows payment status
- [ ] Shows order details (child name, story, email)
- [ ] Status updates in real-time (or after refresh)
- [ ] Download link appears when order is completed
- [ ] Can download PDF from customer page

#### 8.2 Admin Order Management
**Access:** `/admin/orders`

- [ ] Order list displays all orders
- [ ] Orders sorted by creation date (newest first)
- [ ] Each order shows: child name, age, story title, email, status, payment status, price
- [ ] Can click order to view details (`/admin/orders/[orderId]`)
- [ ] Order detail page shows:
  - Customer info (name, age, email)
  - Child photo
  - Story details
  - Payment info (Wompi reference)
  - Order timestamps
- [ ] Can process face-swap from admin panel ("Procesar Face-Swap" button)
- [ ] Processing updates order status to "PROCESSING"
- [ ] Processed images display in admin panel (preview grid)
- [ ] Can generate PDF from admin panel ("Descargar PDF" button)
- [ ] Can manually update order status:
  - Mark as "COMPLETED"
  - Mark as "CANCELLED"
  - Retry if "FAILED"
- [ ] Can view customer page from admin panel (link to `/orders/[orderId]/status`)
- [ ] Processing errors display with retry count

#### 8.3 Email Notifications
- [ ] "Order Received" email sent after successful payment
- [ ] "Order Processing" email sent when face-swap starts
- [ ] "Order Ready" email sent when order completed (with download link)
- [ ] All emails have correct subject lines
- [ ] All emails display correctly (HTML formatting)
- [ ] Test email deliverability (check spam folder)

### 9. Cross-Browser & Device Testing
- [ ] Test on Chrome (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Safari (iOS)
- [ ] Test on Chrome (Android)
- [ ] Test on iPad/tablet
- [ ] Verify all forms work on mobile keyboards
- [ ] Test photo upload on mobile devices

### 10. Performance & Security
- [ ] Page load times acceptable (<3 seconds)
- [ ] Images load progressively
- [ ] Face-swap processing doesn't timeout
- [ ] PDF generation completes in reasonable time
- [ ] Input validation prevents XSS attacks
- [ ] SQL injection protection (Prisma ORM)
- [ ] File upload validates file types and sizes
- [ ] Admin panel requires authentication
- [ ] Payment data handled securely (via Wompi, not stored)
- [ ] Environment variables not exposed to client

### 11. Error Handling
- [ ] 404 page displays for invalid routes
- [ ] Database connection errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Face-swap failures show retry option
- [ ] Payment failures show clear error messages
- [ ] File upload errors display helpful feedback

---

## Testing Notes

**Wompi Sandbox Test Cards:**
- **Approved:** `4242 4242 4242 4242`
- **Declined:** Check Wompi documentation for test decline card
- **CVV:** Any 3 digits
- **Expiry:** Any future date

**Admin Credentials:**
- **URL:** `/admin/login`
- **Password:** Set in `ADMIN_PASSWORD` environment variable (default: `admin123`)

**Test Data:**
- After running `npm run db:seed`, you'll have sample stories in the database
- Use these stories to test the full flow from browsing to purchase

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
