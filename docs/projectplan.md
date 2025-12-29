# MiCuento - Personalized Storybook Platform

## Project Overview

A WONDERWRAPS-style platform that creates hyper-personalized storybooks featuring children as the heroes. Users select predefined stories, input child details (name, age, photo), and the system performs face-swap to place the child into story illustrations.

### Core Features
- Predefined story library with static storylines
- Child personalization (name, age, face-swap)
- PDF generation with personalized content
- E-commerce checkout and delivery

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TailwindCSS
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage or Cloudflare R2
- **Face-Swap API**: Segmind (primary) / Replicate (backup)
- **PDF Generation**: Puppeteer or react-pdf
- **Payments**: Wompi (Colombian gateway - Bancolombia)
- **Hosting**: Vercel

---

## Checkpoints & Tasks

### Checkpoint 1: Project Setup & Foundation
- [x] Initialize Next.js 14 project with TypeScript
- [x] Configure TailwindCSS and design tokens
- [x] Set up ESLint and Prettier
- [x] Configure environment variables structure
- [x] Set up Git repository
- [x] Create basic folder structure (components, lib, app routes)
- [x] Install and configure Shadcn/UI components
- [x] Set up Supabase project and database connection
- [x] Create initial database schema design document

### Checkpoint 2: Database Schema & Models
- [x] Design and create `stories` table (id, title, slug, description, cover_image, page_count, price, status)
- [x] Design and create `story_pages` table (id, story_id, page_number, image_template, text_template)
- [x] Design and create `orders` table (id, user_email, story_id, child_name, child_age, child_photo_url, status, wompi_transaction_id)
- [x] Design and create `generated_books` table (id, order_id, pdf_url, preview_images)
- [x] Set up Prisma ORM
- [x] Create seed data script for test stories
- [x] Write database migration scripts (using db:push for Supabase)

### Checkpoint 3: Story Management (Admin)
- [x] Create admin authentication (simple password protection initially)
- [x] Build admin dashboard layout
- [x] Create story listing page (admin)
- [x] Build story creation form (title, description, cover upload)
- [x] Build story page editor (upload illustration templates, add text templates)
- [x] Implement image upload to cloud storage (URL-based for now)
- [x] Create story preview functionality
- [x] Add story publish/unpublish toggle

### Checkpoint 4: Public Storefront
- [x] Design and build landing page
- [x] Create story catalog/browse page
- [x] Build individual story detail page
- [x] Implement story preview carousel
- [x] Add "How It Works" section
- [x] Create FAQ section
- [x] Build responsive navigation
- [x] Add footer with legal links

### Checkpoint 5: Personalization Flow
- [x] Build personalization wizard/stepper component
- [x] Create child name input with validation
- [x] Create child age selector
- [x] Build photo upload component with guidelines
- [x] Implement client-side image validation (file type/size)
- [x] Create photo preview (cropping deferred to future)
- [x] Build preview of personalized order
- [x] Store personalization data in React state
- [x] Create order summary component

### Checkpoint 6: Face-Swap Integration (Segmind)
- [x] Set up Segmind API account and get API keys
- [x] Create API wrappers for Segmind face-swap v3 AND v4
- [x] Create admin test page to compare v3 vs v4 results
- [x] Implement face detection validation before processing
- [x] Build face-swap processing for each story page
- [x] Create progress indicator for processing
- [x] Implement error handling for failed swaps
- [x] Build retry mechanism for failures
- [ ] Test with various photo types and edge cases
- [x] Set up Replicate as fallback option

### Checkpoint 7: PDF Generation
- [x] Design PDF layout templates matching story pages
- [x] Set up Puppeteer or react-pdf
- [x] Create PDF generation service
- [x] Implement text personalization (name injection using {child_name} tokens)
- [x] Integrate face-swapped images into PDF pages
- [x] Add cover page generation
- [x] Add back cover generation
- [ ] Create PDF preview (low-res watermarked) for user approval
- [x] Implement high-res PDF generation for print/download
- [ ] Upload generated PDFs to cloud storage

### Checkpoint 8: Payment Integration (Wompi)
- [x] Create Wompi business account and get API keys (public + private)
- [x] Set up Wompi sandbox environment for testing
- [x] Create payment widget integration (cards, PSE, Nequi)
- [x] Build cart/checkout page with payment method selection
- [x] Implement Wompi webhook handler for transaction events
- [x] Handle successful payment flow (APPROVED status)
- [x] Handle failed/pending payment flows (DECLINED, VOIDED, ERROR)
- [x] Create order confirmation page
- [x] Send order confirmation email (Resend or similar)
- [x] Implement PSE bank transfer flow
- [x] Implement Nequi payment flow
- [ ] Add cash payment option (Corresponsal Bancolombia) - optional

### Checkpoint 9: Order Management & Delivery
- [x] Create order tracking system
- [x] Build order status page for customers
- [x] Create admin order management dashboard
- [x] Implement order status updates
- [x] Set up email notifications (order received, processing, ready)
- [x] Create digital download delivery
- [ ] Integrate with print-on-demand service (future)

### Checkpoint 10: Testing & QA
- [ ] Test payment flow end-to-end
- [ ] Test face-swap with various photo qualities
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Security basics (input validation, auth)

### Checkpoint 11: Launch Preparation
- [ ] Set up production environment on Vercel
- [ ] Configure domain and SSL
- [ ] Set up error monitoring (Sentry)
- [ ] Create legal pages (Privacy Policy, Terms of Service)
- [ ] Create initial story content (3-5 stories)
- [ ] Final testing
- [ ] Soft launch

---

## Agent Instructions

### Marketing Agent Instructions

**Objective**: Develop and execute marketing strategy to acquire customers for MiCuento personalized storybook platform.

**Research Tasks**:
1. Analyze WONDERWRAPS.com marketing strategy (ads, messaging, channels)
2. Research competitor landscape (Wonderbly, Hooray Heroes, I See Me, Frecklebox)
3. Identify target audience demographics and psychographics
4. Research effective marketing channels for children's products

**Strategy Tasks**:
1. Define unique value proposition vs competitors
2. Create brand voice and messaging guidelines
3. Develop launch marketing plan
4. Plan content marketing strategy (blog, social media)
5. Design referral program structure
6. Plan seasonal campaigns (Christmas, birthdays, holidays)

**Execution Tasks**:
1. Write website copy (landing page, product pages, emails)
2. Create social media content calendar
3. Design Meta/Instagram ad campaigns
4. Set up Google Ads campaigns
5. Create email marketing sequences (welcome, abandoned cart, post-purchase)
6. Develop influencer outreach strategy (parenting bloggers, mommy influencers)
7. Plan PR strategy for launch
8. Create affiliate program structure

**Key Metrics to Track**:
- Customer acquisition cost (CAC)
- Conversion rate by channel
- Average order value (AOV)
- Customer lifetime value (LTV)
- Return on ad spend (ROAS)

---

### Researcher Agent Instructions

**Objective**: Conduct user research to validate product-market fit and inform product decisions for MiCuento.

**User Research Tasks**:
1. Define target user personas (primary buyers: parents, grandparents, gift-givers)
2. Conduct competitive analysis of existing personalized book services
3. Research pain points with current solutions
4. Identify must-have vs nice-to-have features
5. Research pricing sensitivity and willingness to pay
6. Understand purchase decision journey

**Market Research Tasks**:
1. Estimate total addressable market (TAM) for personalized children's books
2. Research market trends and growth projections
3. Analyze seasonal purchasing patterns
4. Research international market opportunities
5. Identify potential B2B opportunities (schools, daycares, hospitals)

**User Needs Analysis**:
1. What story themes resonate most? (adventure, bedtime, educational, self-esteem)
2. What age ranges are most popular?
3. What personalization features matter most?
4. How important is delivery speed?
5. Digital vs physical book preferences
6. Quality expectations (paper, binding, printing)

**Research Methods**:
1. Analyze reviews of competitor products on Amazon, Trustpilot
2. Survey parents in target demographic
3. Conduct user interviews (5-10 potential customers)
4. Analyze social media discussions about personalized books
5. Review Amazon bestsellers in children's personalized books

**Deliverables**:
1. User persona documents
2. Competitive analysis matrix
3. Feature prioritization framework
4. Pricing strategy recommendations
5. Market sizing report

---

### Feature Planning Agent Instructions

**Objective**: Create a prioritized product roadmap for MiCuento based on user needs, technical feasibility, and business impact.

**Phase 1: MVP (Launch)**
Priority: Ship core functionality only

**Must Have**:
- Story catalog (3-5 initial stories)
- Child name personalization
- Face-swap technology (Segmind API)
- PDF generation
- Wompi payments (cards, PSE, Nequi)
- Order confirmation emails
- Basic order management

**Should Have**:
- Mobile-responsive design
- Story preview before purchase
- Photo quality validation
- Order tracking page

**Won't Have (Yet)**:
- User accounts
- Order history
- Multiple children per order
- Gift wrapping
- Custom dedications

---

**Phase 2: Growth (Month 2-3)**
Priority: Increase conversion and retention

**Features to Add**:
- User accounts and order history
- Wishlist functionality
- Gift option (send to different address)
- Custom dedication page
- Multiple book discount
- Email marketing integration
- Review/rating system
- Social sharing of previews

---

**Phase 3: Scale (Month 4-6)**
Priority: Expand offerings and automation

**Features to Add**:
- Subscription option (book club)
- Story bundles
- More story variety (educational, holidays)
- Multi-language support (Spanish priority)
- Print-on-demand API integration
- Advanced analytics dashboard

---

**Phase 4: Expansion (Month 6+)**
Priority: New markets and products

**Features to Consider**:
- Photo books (not just stories)
- Corporate/bulk ordering
- API for partners
- International shipping optimization
- Mobile app

---

**Prioritization Framework**:
Use RICE scoring:
- **R**each: How many customers will this impact?
- **I**mpact: How much will it impact them? (3=massive, 2=high, 1=medium, 0.5=low)
- **C**onfidence: How confident are we in estimates?
- **E**ffort: How many person-weeks?

Score = (Reach × Impact × Confidence) / Effort

---

## Review Section
*(To be completed as work progresses)*

| Checkpoint | Status | Notes |
|------------|--------|-------|
| 1. Project Setup | Completed | Next.js 14, Tailwind, Shadcn, Supabase client |
| 2. Database Schema | Completed | Prisma 6.x, 4 tables, seed script |
| 3. Story Management | Completed | Admin auth, CRUD stories & pages |
| 4. Public Storefront | Completed | Landing, catalog, detail, navbar, footer, FAQ |
| 5. Personalization Flow | Completed | Wizard, name/age, photo upload, preview |
| 6. Face-Swap Integration | In Progress | Segmind v3/v4 wrappers done, admin test page done |
| 7. PDF Generation | Not Started | |
| 8. Payment Integration | Not Started | |
| 9. Order Management | Not Started | |
| 10. Testing & QA | Not Started | |
| 11. Launch Preparation | Not Started | |

---

## Open Questions
- [ ] Which Segmind version to use? (v3 vs v4 - need to test quality)
- [ ] Self-fulfillment vs print-on-demand partner?
- [ ] Initial story themes to create?
- [ ] Target launch date?
- [ ] Geographic focus for launch (country/region)?
- [ ] Pricing per book?
