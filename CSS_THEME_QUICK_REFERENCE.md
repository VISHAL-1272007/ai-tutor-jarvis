# 🎨 CSS PRODUCTION THEME - QUICK REFERENCE

## COLOR SYSTEM

```css
/* Deep Charcoal Dark Theme */
Background Primary:      #0F0F0F
Background Hover (Light): rgba(255, 255, 255, 0.02)
Background Hover (Med):   rgba(255, 255, 255, 0.03)
Background Hover (Heavy): rgba(255, 255, 255, 0.05)
Background Active:       rgba(255, 255, 255, 0.08)

Text Primary (100%):     #ffffff
Text Secondary (60%):    rgba(255, 255, 255, 0.6)
Text Tertiary (40%):     rgba(255, 255, 255, 0.4)

Border Subtle:           rgba(255, 255, 255, 0.05)
Border Default:          rgba(255, 255, 255, 0.1)
Border Strong:           rgba(255, 255, 255, 0.15)

Inner Glow:              inset 0 0 10px rgba(255, 255, 255, 0.05)
```

---

## REUSABLE COMPONENT PATTERNS

### 1. GLASS CONTAINER (Sidebar, Header)
```css
.glass-container {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur-xl;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}
```

### 2. BUTTON DEFAULT STATE
```css
.button-default {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    transition: transition-all 300ms ease-in-out;
}
```

### 3. BUTTON HOVER STATE
```css
.button-default:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}
```

### 4. BUTTON ACTIVE STATE
```css
.button-default.active {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.06);
}
```

### 5. SECONDARY TEXT LABEL
```css
.label-secondary {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
```

### 6. LIST ITEM INTERACTIVE
```css
.list-item {
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid transparent;
    transition: transition-all 300ms ease-in-out;
}

.list-item:hover {
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.05);
}

.list-item.active {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
}
```

---

## TRANSITIONS

```css
/* Standard Professional Transition */
transition: transition-all 300ms ease-in-out;

/* Components Using This Timing */
- All buttons
- Interactive elements
- Hover states
- Active states
- Focus states
```

---

## TYPOGRAPHY HIERARCHY

```css
/* Level 1: Primary Heading/Brand */
.type-h1 {
    color: #ffffff;
    font-weight: 700;
    font-size: 18px;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
}

/* Level 2: Primary Action Text */
.type-primary {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
}

/* Level 3: Secondary Text */
.type-secondary {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    font-size: 13px;
}

/* Level 4: Tertiary/Disabled */
.type-tertiary {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
    font-size: 12px;
}
```

---

## MICRO-INTERACTIONS

### Hover Lift
```css
transform: translateY(-1px);
```

### Inner Glow on Hover
```css
box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
```

### Subtle Border Reveal
```css
border-color: rgba(255, 255, 255, 0.05); /* default */
border-color: rgba(255, 255, 255, 0.1);  /* hover */
```

### Background Lift
```css
background: rgba(255, 255, 255, 0.02); /* default */
background: rgba(255, 255, 255, 0.05); /* hover */
```

---

## OPACITY SCALE

| Purpose | Opacity | Example |
|---------|---------|---------|
| Barely Visible | 2% | Background default |
| Subtle | 3% | Hover light state |
| Light | 5% | Hover medium state |
| Medium | 6% | Glow effect |
| Strong | 8% | Active background |
| Heavy | 10% | Border hover |
| Strong | 15% | Border active |
| Primary | 40% | Tertiary text |
| Secondary | 60% | Secondary text |
| Full | 100% | Primary text (#ffffff) |

---

## GENERATORS & STUDY TOOLS BUTTONS

**These use standard `.header-btn` styling (NO special gradients or colors)**:

```css
.header-btn {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.6) !important;
    transition: transition-all 300ms ease-in-out !important;
}

.header-btn:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #ffffff !important;
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
}
```

**Result**: Unified, minimalist aesthetic across all navigation buttons

---

## UPDATED COMPONENTS MAP

| Component | File | Lines | Key Class |
|-----------|------|-------|-----------|
| Sidebar | style-pro.css | 180-240 | `.sidebar` |
| Sidebar Header | style-pro.css | 189-210 | `.sidebar-header` |
| New Chat Btn | style-pro.css | 235-250 | `.new-chat-btn` |
| Chat History | style-pro.css | 252-275 | `.chat-history` |
| History Items | style-pro.css | 290-310 | `.history-item` |
| Sidebar Footer | style-pro.css | 365-380 | `.sidebar-footer` |
| Theme Selector | style-pro.css | 390-420 | `.theme-selector-container` |
| Account Btn | style-pro.css | 440-460 | `.sidebar-account-btn` |
| Header | style-pro.css | 480-500 | `.header` |
| Header Buttons | style-pro.css | 602-635 | `.header-btn` |
| Header Links | style-pro.css | 642-675 | `.header-link` |
| Settings Button | style-pro.css | 680-695 | `.settings-btn` |

---

## DEBUGGING TIPS

### Button Not Showing Inner Glow?
Check for:
```css
box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
```

### Text Color Wrong?
Verify hierarchy:
- Primary: `#ffffff` (100%)
- Secondary: `rgba(255, 255, 255, 0.6)` (60%)
- Tertiary: `rgba(255, 255, 255, 0.4)` (40%)

### Border Not Visible?
Ensure you're using:
```css
border: 1px solid rgba(255, 255, 255, 0.05);
```
(NOT `border: 1px solid rgba(255, 255, 255, 0.01);`)

### Transition Not Smooth?
Confirm all buttons use:
```css
transition: transition-all 300ms ease-in-out;
```

---

## COPY-PASTE TEMPLATES

### New Button Component
```css
.new-button {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: transition-all 300ms ease-in-out;
}

.new-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
}

.new-button:active {
    transform: scale(0.98);
}
```

### New Panel/Container
```css
.new-panel {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur-xl;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}
```

---

## PERFORMANCE NOTES

- ✅ Pure CSS (zero JavaScript overhead)
- ✅ backdrop-filter supported on modern browsers
- ✅ No layout recalculations
- ✅ GPU-accelerated transitions
- ✅ No paint thrashing
- ✅ Minimal file size impact

---

**Version**: 1.0  
**Last Updated**: January 31, 2026  
**Status**: Production Ready ✅
