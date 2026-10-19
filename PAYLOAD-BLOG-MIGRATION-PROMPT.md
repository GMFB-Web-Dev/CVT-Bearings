# Prompt for the Payload agent: create the CVT Bearings blog posts

Work in the Payload CMS project that owns `https://payload.gmfb.co.nz`. Create or update the CVT Bearings posts in the `blog-posts` collection. This is a CMS data task, not a frontend task.

## Scope and safety

- Target tenant: `cvt-bearings`, numeric tenant ID `6` only.
- Do not modify another tenant.
- Inspect existing tenant-6 `blog-posts` first. Upsert by tenant + slug; do not create duplicates. There may already be three draft records.
- Create all six records below in `blog-posts`, not in the legacy `pages` collection.
- Use the normal site `media` collection for featured images, not `product-media`.
- Keep the six URLs exactly as specified.
- Public content must use `title`. If `adminTitle` is required, use `CVT Bearings — <title>` only as an admin label.
- Use valid Payload Lexical JSON for rich-text fields. Do not store raw HTML or Markdown in Lexical fields.
- Write in clear New Zealand English for vehicle owners, transmission rebuilders, and parts buyers. Be technically careful: do not invent bearing specifications, diagnosis certainty, torque values, temperatures, service intervals, or fitment claims. Recommend confirmation by part number, transmission code, dimensions, and a qualified specialist where appropriate.
- Publish the six completed records only after validating them. Set `_status: published` and `publishedAt: 2026-10-08T00:00:00.000Z` unless the project requires a different ISO representation.
- Do not delete the six old `pages` documents in this task; retain them temporarily as a migration audit trail. The frontend will no longer read them.

## Collection contract

Populate these fields where supported:

- `tenant`: relationship to tenant ID `6`
- `title`
- `adminTitle`: `CVT Bearings — <title>`
- `slug`
- `path`: `/blogs/<slug>`
- `template`: `article` or `guide` as specified below
- `excerpt`
- `featuredImage`: existing media relationship listed below
- `featuredImageAlt`
- `author`: `CVT Bearings NZ`
- `category`
- `publishedAt`
- `body`: Payload Lexical JSON
- Guide-only fields: `tools` and `steps[] { title, body, image, imageAlt }`
- `cta`: `{ heading: "Need help identifying a CVT bearing?", label: "Ask our team", href: "/contact" }`
- `seo`: `{ title, description }`
- `_status`: `published`

The frontend only exposes documents returned by this public query:

`GET /api/blog-posts?where[tenant][equals]=6&where[_status][equals]=published&sort=-publishedAt&limit=12&page=1&depth=1`

## Existing media to reuse

Use these exact tenant-6 media records:

| Media ID | URL | Existing alt |
|---:|---|---|
| 57 | `https://media.gmfb.co.nz/media/hero.jpg` | CVT Bearings hero |
| 69 | `https://media.gmfb.co.nz/media/transmission.jpg` | CVT Bearings transmission |
| 39 | `https://media.gmfb.co.nz/media/blog-detail.jpg` | CVT Bearings blog detail |
| 48 | `https://media.gmfb.co.nz/media/category-pulley.png` | CVT Bearings category pulley |
| 46 | `https://media.gmfb.co.nz/media/category-kit.png` | CVT Bearings category kit |
| 47 | `https://media.gmfb.co.nz/media/category-primary.png` | CVT Bearings category primary |

## Six records to create or update

### 1. How to Identify the Correct CVT Bearing Before Ordering

- Slug: `identify-the-correct-cvt-bearing-before-ordering`
- Path: `/blogs/identify-the-correct-cvt-bearing-before-ordering`
- Template: `guide`
- Category: `Buying Guide`
- Featured image: media ID `57`
- Featured image alt: `CVT transmission bearings being identified before ordering`
- Excerpt: `Learn how to identify the correct CVT bearing using the transmission code, original bearing markings, accurate measurements and clear photos.`
- SEO title: `How to Identify the Correct CVT Bearing Before Ordering`
- SEO description: `Use transmission details, bearing markings, measurements and photos to identify the correct CVT bearing before ordering in New Zealand.`
- Tools: one item per line: `Vehicle VIN or chassis details`, `Transmission identification code`, `Original bearing`, `Vernier callipers`, `Camera or phone`
- Intro body: explain that make, model and year are useful starting points but may not uniquely identify the transmission; engine, drivetrain, production date and import status can change the fitted CVT.
- Guide steps, using the legacy source copy below:
  1. `Start by identifying the correct CVT` — `The first step in CVT bearing identification is confirming exactly which transmission is fitted to the vehicle. A vehicle make, model and year can provide a useful starting point, but they may not be enough to identify the transmission accurately. Engine size, drivetrain, production date and whether the vehicle is New Zealand-new or imported can lead several CVT options to be listed.` Follow with: `Where possible, confirm the VIN or chassis number and locate the transmission identification code before ordering internal parts.`
  2. `Check the original bearing part number` — `If the transmission has already been dismantled, inspect the original bearing carefully before ordering a replacement. Many bearings have identifying numbers stamped, etched or laser-marked onto their rings. These markings may include the bearing manufacturer, bearing number, series information or other specification codes.`
  3. `Measure the CVT bearing` — `Bearing dimensions are particularly useful when the original part number is damaged, unreadable or unavailable. The three main measurements are the inner diameter, outer diameter and width. Measure accurately with vernier callipers and note whether the inner ring has a shoulder, step or recess.`
  4. `Why dimensions alone are not enough` — `Two bearings can sometimes share the same basic dimensions while having different specifications. Differences in internal clearance, sealing, load capacity, contact angle or application can mean that a bearing which physically fits is not necessarily the correct bearing for the transmission.`
  5. `Match the transmission and bearing information together` — `The best way to identify a CVT bearing is to combine several pieces of information rather than relying on a single detail. For example, knowing that a bearing came from a particular transmission code, is fitted to a certain location, has a readable manufacturer part number and measures a specific size provides a much stronger identification than simply ordering a bearing for a particular vehicle.`
  6. `Take clear photos before ordering` — `Photographs can help when part numbers are difficult to read or when there is uncertainty about the bearing. Take clear images of both sides, the markings, the transmission location and any damage. Include a ruler or calliper in at least one photograph for scale.`
  7. `Keep the original bearing` — `Do not dispose of the original bearing until the replacement has been identified and confirmed. Even if damaged, it can still provide useful information about its dimensions, markings and construction.`

### 2. CVT Bearing Noise: How to Tell Which Bearing May Be Failing

- Slug: `signs-your-cvt-bearing-may-be-failing`
- Path: `/blogs/signs-your-cvt-bearing-may-be-failing`
- Template: `article`
- Category: `Diagnostics`
- Featured image: media ID `69`
- Featured image alt: `CVT transmission components inspected during bearing noise diagnosis`
- Excerpt: `Understand common CVT bearing-noise patterns, what they can and cannot prove, and the checks that help narrow down the source.`
- SEO title: `CVT Bearing Noise: How to Tell Which Bearing May Be Failing`
- SEO description: `Learn how CVT bearing noises may change with road speed, engine load or transmission operation, and why careful diagnosis matters.`
- Body requirements: write a useful original article with an introduction and sections covering: why noise alone does not identify a bearing; road-speed-related versus engine-speed-related noise; changes under acceleration, deceleration and cornering; ruling out wheel bearings, tyres, accessories and other transmission faults; the value of fluid-condition checks and professional inspection; why teardown findings and original bearing markings matter; and when to contact a CVT specialist. Avoid claiming that any sound definitively proves a particular internal failure.

### 3. Why Bearing Measurements Matter for CVT Repairs

- Slug: `why-measurements-matter`
- Path: `/blogs/why-measurements-matter`
- Template: `article`
- Category: `Practical Advice`
- Featured image: media ID `39`
- Featured image alt: `CVT bearing dimensions checked with precision measuring tools`
- Excerpt: `See why inner diameter, outer diameter and width are essential identification checks—and why measurements must be combined with other evidence.`
- SEO title: `Why Bearing Measurements Matter for CVT Repairs`
- SEO description: `Learn which CVT bearing dimensions to record, how design details affect fitment, and why measurements alone are not enough.`
- Body requirements: write an original article covering: inner diameter, outer diameter and width; shoulders, steps, recesses, seals and ring geometry; clean measuring surfaces and appropriate tools; recording units and multiple readings; why equal dimensions do not guarantee equal specification; combining measurements with manufacturer markings, transmission code and installation location; useful photo angles; and retaining the original bearing until fitment is confirmed.

### 4. Understanding Primary and Secondary Pulley Bearings

- Slug: `understanding-pulley-bearings`
- Path: `/blogs/understanding-pulley-bearings`
- Template: `article`
- Category: `Product Guide`
- Featured image: media ID `48`
- Featured image alt: `Primary and secondary CVT pulley bearing components`
- Excerpt: `A practical overview of primary and secondary pulley bearings, their different locations, and the information needed for correct replacement.`
- SEO title: `Understanding Primary and Secondary Pulley Bearings`
- SEO description: `Understand the role of primary and secondary CVT pulley bearings and how to identify the correct replacement for each location.`
- Body requirements: write an original, high-level article covering: the role of the primary and secondary pulley assemblies; why bearing position and transmission design matter; radial and axial loading in general terms without unsupported specifications; how two similar-looking bearings can differ; identifying pulley side and installation location; checking transmission codes and original markings; inspecting related surfaces and components; and confirming replacement suitability before installation.

### 5. Bearing Handling Tips for Transmission Rebuilders

- Slug: `bearing-care-for-rebuilders`
- Path: `/blogs/bearing-care-for-rebuilders`
- Template: `guide`
- Category: `Workshop`
- Featured image: media ID `46`
- Featured image alt: `CVT bearing kit prepared for clean workshop handling`
- Excerpt: `Practical handling, storage and installation habits that help transmission rebuilders avoid contaminating or damaging replacement bearings.`
- SEO title: `Bearing Handling Tips for Transmission Rebuilders`
- SEO description: `Follow practical CVT bearing storage, cleanliness, handling and installation principles for transmission rebuilding work.`
- Tools: one item per line: `Clean lint-free work area`, `Clean gloves`, `Correct bearing installation tools`, `Original bearing and identification notes`, `Manufacturer service information`
- Guide steps: write original content for these steps: `Store bearings clean and dry`; `Prepare a clean work area`; `Keep packaging sealed until needed`; `Handle rings and seals carefully`; `Apply installation force to the correct ring`; `Use heat only within manufacturer guidance`; `Check lubrication and sealing requirements`; `Inspect the installation before assembly`. Do not provide universal temperatures, force values or lubricant specifications.

### 6. When a Specialist Bearing Quote Is the Right Choice

- Slug: `when-to-ask-for-a-quote`
- Path: `/blogs/when-to-ask-for-a-quote`
- Template: `article`
- Category: `Ordering`
- Featured image: media ID `47`
- Featured image alt: `CVT bearing details gathered for a specialist quote`
- Excerpt: `Know when a specialist quote is the safest route and what vehicle, transmission, bearing, measurement and photo details to include.`
- SEO title: `When a Specialist Bearing Quote Is the Right Choice`
- SEO description: `Find out when to request a specialist CVT bearing quote and which details help confirm availability and correct fitment.`
- Body requirements: write an original article covering: when catalogue matching is uncertain; damaged or unreadable part numbers; imported vehicles or multiple transmission variants; unusual bearing geometry; workshop quantities or kits; the information to provide (VIN or chassis, make/model/year, engine, transmission code, bearing location, markings, dimensions and photos); why a quote reduces avoidable identification errors; lead time and quantity information; and keeping the original part until the replacement is confirmed.

## Important legacy-content finding

The old frontend contained six different cards but the six legacy `pages` documents all reused the exact same identification article body. Do not copy that body into all six new posts. Use it only as the source for post 1. Posts 2–6 must receive the topic-specific original content described above.

Legacy card mapping was:

| Slug | Title | Category | Old image |
|---|---|---|---|
| `identify-the-correct-cvt-bearing-before-ordering` | How to Identify the Correct CVT Bearing Before Ordering | Buying Guide | `/assets/hero.jpg` |
| `signs-your-cvt-bearing-may-be-failing` | CVT Bearing Noise: How to Tell Which Bearing May Be Failing | Diagnostics | `/assets/transmission.jpg` |
| `why-measurements-matter` | Why Bearing Measurements Matter for CVT Repairs | Practical Advice | `/assets/blog-detail.jpg` |
| `understanding-pulley-bearings` | Understanding Primary and Secondary Pulley Bearings | Product Guide | `/assets/category-pulley.png` |
| `bearing-care-for-rebuilders` | Bearing Handling Tips for Transmission Rebuilders | Workshop | `/assets/category-kit.png` |
| `when-to-ask-for-a-quote` | When a Specialist Bearing Quote Is the Right Choice | Ordering | `/assets/category-primary.png` |

## Validation and completion report

After upserting and publishing:

1. Query the public API with tenant `6`, `_status=published`, `depth=1`, and confirm exactly these six slugs are returned.
2. Confirm a draft-only test post is not returned publicly, then remove the test record if one was created.
3. Confirm every featured image is populated from `media` and resolves publicly.
4. Confirm all `path` values exactly match `/blogs/<slug>`.
5. Confirm no duplicate tenant+slug records were created.
6. Confirm the existing Payload revalidation webhook fires for `blog-posts` create/update/publish operations with `tenantSlug: cvt-bearings`.
7. Report the six document IDs, slugs, statuses, public API result count, and any editorial assumptions or fields the schema did not support.
