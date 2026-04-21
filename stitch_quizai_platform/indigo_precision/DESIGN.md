# Design System Specification

## 1. Overview & Creative North Star: The Intellectual Monolith
This design system is built upon the philosophy of **Utilitarian Prestige**. It rejects the cluttered "app-like" interface in favor of a high-end editorial experience. The Creative North Star is "The Intellectual Monolith"—a space that feels academic yet cutting-edge, where every pixel serves a functional purpose but is delivered with the spatial confidence of a modern art gallery.

By leaning into intentional asymmetry and varying typographic scales, we move away from generic "SaaS-standard" grids. The aesthetic is defined by its restraint: we use white space not as a void, but as a structural element that guides the user’s focus toward the AI-driven content.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a pristine white base with a deep, authoritative Indigo (`#4f46e5`) used for surgical precision.

### The "No-Line" Rule
To maintain a high-end aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries between content areas must be achieved through:
1.  **Tonal Shifts:** Transitioning from `surface` (#fcf8ff) to `surface-container-low` (#f5f2ff).
2.  **Negative Space:** Using the Spacing Scale to create "islands" of content.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Hierarchy is defined by "nesting" rather than "framing":
*   **Base:** `surface` (#fcf8ff) for the primary canvas.
*   **Mid-Level:** `surface-container-low` (#f5f2ff) for sidebars or secondary navigation.
*   **Highest Interest:** `surface-container-highest` (#e4e1ee) for interactive elements or emphasized data visualizations.

### Signature Polishing
While the system is utilitarian, main CTAs should use the `primary` (#3525cd) to `primary_container` (#4f46e5) tonal range. Avoid flashy decorative gradients; instead, use these tokens to create a subtle sense of depth on the Z-axis, ensuring the interface feels "built" rather than "drawn."

---

## 3. Typography: The Editorial Voice
We use **Inter** exclusively. The distinction between "Display" and "Label" styles is the engine of this design system’s personality.

*   **Display Scales (lg/md):** Use these for hero statements or quiz titles. They should feel authoritative and be set with a slightly tighter letter-spacing (-0.02em) to mimic high-end print journals.
*   **Headline & Title:** These are the functional anchors. Use `headline-sm` (1.5rem) for section headers to maintain a clean, readable flow.
*   **Label Scales:** Use `label-md` (0.75rem) in All-Caps with increased letter-spacing (+0.05em) for metadata, categories, or AI status indicators. This adds a "utilitarian-chic" feel that separates data from narrative.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are heavy and dated. This system achieves depth through sophisticated tonal stacking.

*   **The Layering Principle:** To create a "card" effect, place a `surface_container_lowest` (#ffffff) element on top of a `surface_container` (#f0ecf9) background. This creates a natural, soft lift.
*   **Ambient Shadows:** If a floating element (like a modal or dropdown) requires a shadow, use a highly diffused blur (20px-40px) at a maximum of 4% opacity, using the `on_surface` color (#1b1b24) as the base to simulate natural environmental light.
*   **The "Ghost Border":** For input fields or containers requiring extra definition, use a `outline_variant` (#c7c4d8) at **15% opacity**. This provides a hint of structure without breaking the minimalist "No-Line" rule.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container` (#4f46e5) with `on_primary` (#ffffff) text. Minimalist `round-md` (0.375rem) corners.
*   **Secondary:** `surface_container_high` (#eae6f4) background. No border. This creates a sophisticated, low-contrast alternative to the primary action.
*   **States:** On hover, shift the background color one tier darker (e.g., Primary moves to `primary` #3525cd).

### Input Fields
*   **Visual Style:** Ghost borders only. Use `surface_container_lowest` (#ffffff) for the background to "pop" against the `surface`.
*   **Focus State:** A 2px solid `primary_container` (#4f46e5) bottom-border only. This maintains the utilitarian, "architectural" feel.

### Cards & Lists
*   **Strict Rule:** No dividers. Separate list items using `8px` or `16px` of vertical whitespace.
*   **Cards:** Use `round-lg` (0.5rem) for large content blocks. Ensure padding is generous (minimum 24px/1.5rem) to maintain the "high-end" feel.

### Specialized AI Components
*   **Analysis Chips:** Use `secondary_container` (#b6b4ff) with `on_secondary_container` (#454386) for AI-generated tags.
*   **Progress Indicators:** Use thin, 2px horizontal bars using the `primary` color. Avoid circular loaders; horizontal bars feel more analytical and aligned with the "Monolith" aesthetic.

---

## 6. Do's and Don'ts

### Do
*   **Embrace Asymmetry:** Align text to the left but allow imagery or data visualizations to bleed into the margins.
*   **Use Generous Whitespace:** If it feels like "too much" space, add 10% more. This is the hallmark of premium design.
*   **Type Hierarchy:** Use `label-sm` for auxiliary info to keep the interface from looking "crowded."

### Don't
*   **No Black:** Never use #000000. Use `on_surface` (#1b1b24) for high-contrast text to keep the palette sophisticated.
*   **No Heavy Rounds:** Avoid `rounded-full` for anything other than specific icon buttons or status chips. Stay within the `md/lg` (0.375rem/0.5rem) range to maintain a professional, structured look.
*   **No Borders:** Avoid the urge to "box in" content. Let the background color shifts do the work.