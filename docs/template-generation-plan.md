# Plan: Generating Consistent Character Templates for Face-Swap Storybooks

## The Challenge

You need to create story page illustrations where:
1. The **same character** appears consistently across all pages
2. The character's face can be **swapped** with a child's photo using Comic Face-Swap API
3. The **art style** remains consistent throughout the story

---

## Recommended Workflow

### Phase 1: Character Design Document

Create a detailed **Character Reference Sheet** before generating any images:

```
CHARACTER SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━
Name: "Story Hero" (generic placeholder)
Age appearance: 5-7 years old
Body type: Child proportions
Height: Consistent across pages

VISUAL ATTRIBUTES:
- Hair: Short, simple style (won't interfere with face-swap)
- Clothing: Distinctive outfit that's easy to replicate
  Example: Red t-shirt, blue shorts, white sneakers
- Accessories: Optional simple item (backpack, hat)
- Skin tone: Neutral/medium (adapts well to various swaps)

FACE GUIDELINES (Critical for face-swap):
- Simple, round face shape
- Large eyes (cartoon style)
- Small nose
- Neutral or happy expression
- Face clearly visible (no obstructions)
- Front-facing or 3/4 view preferred
```

---

### Phase 2: Choose Your Generation Method

#### **Option A: AI Image Generation (Recommended)**

**Best Tools:**

| Tool | Consistency Method | Best For |
|------|-------------------|----------|
| **Midjourney** | `--cref` (character reference) | High-quality illustrations |
| **Stable Diffusion** | LoRA training or IP-Adapter | Full control, local |
| **DALL-E 3** | Detailed prompts | Quick prototyping |
| **Segmind Consistent Character** | API-based | Automation potential |

**Midjourney Workflow Example:**
```
Step 1: Generate character reference image
/imagine cartoon child hero, 6 years old, red shirt blue shorts,
round friendly face, children's book illustration style --ar 1:1

Step 2: Use that image as character reference for all pages
/imagine [scene description] --cref [character_image_url] --cw 100
```

#### **Option B: Professional Illustrator**

Provide illustrator with:
- Character reference sheet
- Face-swap technical requirements
- Style guide
- All scene descriptions

#### **Option C: Hybrid Approach (Recommended for MiCuento)**

1. Use AI to generate **base character design**
2. Use AI with character reference for **all scene variations**
3. Optionally have artist **refine/clean up** for consistency

---

### Phase 3: Face-Swap Optimization Guidelines

**For EVERY template image, ensure:**

```
FACE REQUIREMENTS FOR COMIC FACE-SWAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DO:
- Face takes up 15-30% of image height
- Face is clearly visible and unobstructed
- Front-facing (0°) or slight angle (up to 30°)
- Good lighting on face
- Neutral or mild expression
- Eyes clearly visible
- Simple cartoon/illustration style face

❌ AVOID:
- Profile views (90° side)
- Face covered by hands/objects/hair
- Extreme expressions (wide open mouth, etc.)
- Face too small in frame
- Complex realistic faces (harder to swap)
- Multiple characters with similar faces
```

---

### Phase 4: Story Template Structure

**For each story, create:**

```
STORY: "La Gran Aventura"
━━━━━━━━━━━━━━━━━━━━━━━

Page 1: Introduction
- Scene: Child standing in bedroom
- Character: Front-facing, full body
- Face position: Center, large
- Expression: Curious/excited

Page 2: Discovery
- Scene: Finding magical object in garden
- Character: 3/4 view, looking at object
- Face position: Upper-left
- Expression: Surprised/wonder

Page 3: Journey begins
- Scene: Walking into forest
- Character: Side-walking, face turned toward viewer
- Face position: Right side
- Expression: Determined

[... continue for all pages]
```

---

### Phase 5: Generation Prompt Template

**Master prompt structure for consistency:**

```
[STYLE] + [CHARACTER] + [SCENE] + [FACE POSITION] + [TECHNICAL]

Example:
"Children's book illustration, watercolor style,
young child with red shirt and blue shorts, round friendly face,
standing in a magical forest clearing looking at a glowing butterfly,
face turned toward viewer with wonder expression,
soft lighting, vibrant colors, --ar 3:2 --cref [ref_url]"
```

---

### Phase 6: Quality Control Checklist

Before using any template image, verify:

```
□ Character matches reference (clothes, proportions)
□ Face is clearly visible
□ Face angle is front or 3/4 view
□ Face size is adequate (15-30% of image)
□ No obstructions on face
□ Style matches other pages
□ Test face-swap produces good results
```

---

## Practical Implementation for MiCuento

### Step 1: Create Test Story (3-5 pages)

1. Write simple story outline
2. Generate character reference
3. Generate each scene with character reference
4. Test face-swap on ALL pages before finalizing

### Step 2: Test with Comic Face-Swap API

Use your `/admin/faceswap-comic-test` page to:
- Test each template with sample child photos
- Adjust `face_strength` and `style_strength` for best results
- Document optimal settings per image

### Step 3: Optimal Settings Discovery

```
Recommended starting values:
- face_strength: 0.7-0.85 (preserve child's features)
- style_strength: 1.0-1.5 (adapt to illustration style)
- steps: 20-30 (balance quality/speed)
- cfg: 1.5-2.0 (style adherence)
```

### Step 4: Create Template Storage Structure

```
/stories
  /la-gran-aventura
    /templates
      - page-01-template.jpg  (original illustration)
      - page-02-template.jpg
      - page-03-template.jpg
    /metadata
      - faceswap-settings.json  (optimal params per page)
```

---

## Tools to Build in Admin Panel

### Tool 1: Consistent Character Generator (`/admin/character-generator`)

**Purpose:** Generate story page illustrations with consistent character across all pages

**How it works:**
1. Upload a **reference character image** (your base character design)
2. Enter **scene prompts** for each page of the story
3. API generates images maintaining the same character in different scenes
4. Download generated images to use as story templates

**Segmind Consistent Character API:**
- **Endpoint:** `https://api.segmind.com/v1/consistent-character`
- **Key Parameters:**
  - `subject`: URL/base64 of reference character image
  - `prompt`: Scene description (e.g., "child in magical forest, looking at glowing butterfly")
  - `negative_prompt`: What to avoid (e.g., "multiple people, adults")
  - `randomise_poses`: true/false - vary character poses
  - `number_of_outputs`: Generate multiple variations

**Workflow:**
```
Step 1: Create/Upload base character design
         ↓
Step 2: Write prompts for each story page
         ↓
Step 3: Generate all pages with consistent character
         ↓
Step 4: Review and select best variations
         ↓
Step 5: Save as story templates
```

---

### Tool 2: Template Validation Tool (`/admin/template-validator`)

**Purpose:** Test story templates with face-swap BEFORE publishing the story

**Why it's different from current Face-Swap Test page:**
- Current page: Tests ONE image at a time (exploration/experimentation)
- Validator: Tests ALL pages of a story in batch (production workflow)

**Features:**
1. **Batch Testing**
   - Select a story from your library
   - Upload a sample child photo
   - Automatically test face-swap on ALL pages
   - See results side-by-side

2. **Per-Page Settings**
   - Different pages may need different face-swap settings
   - Face angle, size, and style vary per illustration
   - Save optimal settings per page in database

3. **Quality Scoring**
   - Automatically flag pages where face-swap may fail
   - Detect: face too small, bad angle, obstructions
   - Mark pages as "validated" or "needs attention"

4. **Preview Generation**
   - Generate sample preview of personalized book
   - Use for marketing/sales page

**Database Addition:**
```prisma
model StoryPage {
  // ... existing fields
  faceSwapSettings Json?  // { faceStrength, styleStrength, steps, cfg }
  validationStatus String? // "pending", "validated", "needs_review"
  validationNotes  String?
}
```

**Workflow:**
```
Step 1: Upload template images to story pages
         ↓
Step 2: Go to Template Validator
         ↓
Step 3: Select story + upload sample child photo
         ↓
Step 4: Run batch face-swap on all pages
         ↓
Step 5: Review results, adjust settings per page
         ↓
Step 6: Save settings & mark as validated
         ↓
Step 7: Story ready for production
```

---

### Tool 3: Story Template Upload Workflow (Enhanced Story Editor)

**Purpose:** Streamlined workflow for adding new stories with templates

**Current flow:**
1. Create story (title, description, price)
2. Add pages one by one
3. Manually enter image URLs
4. No face-swap testing integration

**Enhanced flow:**
1. **Story Creation Wizard**
   ```
   Step 1: Basic Info (title, description, price)
   Step 2: Upload All Templates (drag-drop multiple images)
   Step 3: Auto-order pages or drag to reorder
   Step 4: Add text templates with {child_name} tokens
   Step 5: Configure face-swap settings per page
   Step 6: Validate with sample photo
   Step 7: Publish
   ```

2. **Smart Template Upload**
   - Upload multiple images at once
   - Auto-detect face position and suggest settings
   - Preview face-swap result before saving

3. **Template Requirements Check**
   - Warn if image resolution too low
   - Warn if no face detected
   - Suggest optimal settings based on face analysis

**Integration with other tools:**
```
Character Generator → generates templates
         ↓
Template Upload → imports generated images
         ↓
Template Validator → tests all pages
         ↓
Story Published → ready for customers
```

---

## Complete Admin Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTENT CREATION PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CHARACTER GENERATOR                                          │
│     ├─ Upload reference character                                │
│     ├─ Enter scene prompts                                       │
│     └─ Generate consistent illustrations                         │
│              ↓                                                   │
│  2. STORY TEMPLATE UPLOAD                                        │
│     ├─ Create new story                                          │
│     ├─ Upload generated templates                                │
│     ├─ Add text with {child_name} tokens                         │
│     └─ Configure initial face-swap settings                      │
│              ↓                                                   │
│  3. TEMPLATE VALIDATOR                                           │
│     ├─ Batch test all pages                                      │
│     ├─ Fine-tune settings per page                               │
│     ├─ Mark as validated                                         │
│     └─ Generate preview samples                                  │
│              ↓                                                   │
│  4. PUBLISH STORY                                                │
│     └─ Story available to customers                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

| Priority | Tool | Effort | Value |
|----------|------|--------|-------|
| 1 | Consistent Character Generator | Medium | High - Automates template creation |
| 2 | Template Validator | Medium | High - Ensures quality before publish |
| 3 | Enhanced Story Upload | Low | Medium - Improves workflow efficiency |
