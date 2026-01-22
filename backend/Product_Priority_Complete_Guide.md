# 📚 Stage 7: Product Priority - Complete Guide

## 🎯 Overview

Stage 7 implements a comprehensive product priority system within sections:

1. **Drag-and-Drop Reordering** - Change product display order
2. **Pin to Top** - Keep important products at the top
3. **Featured Products** - Special highlighting for selected items
4. **Position Management** - Precise control over product placement
5. **Bulk Updates** - Efficient batch operations
6. **Custom Notes** - Admin notes for product placement decisions

---

## 🗄️ Data Structure

### **ProductPriority Schema**

```typescript
{
  product: ObjectId,        // Reference to product
  position: number,         // 0-based ordering (0 = first)
  isPinned: boolean,        // Pin to top of section
  isFeatured: boolean,      // Special highlighting
  customNote?: string       // Optional admin note (max 200 chars)
}
```

### **Section Updates**

```typescript
{
  // ... existing fields ...
  products: ObjectId[],              // Deprecated but kept for compatibility
  productPriorities: ProductPriority[] // New priority system
}
```

---

## 📡 API Endpoints

### **1. Get Products with Priorities**

```http
GET /api/sections/:id/priorities
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sectionId": "...",
    "sectionName": {...},
    "products": [
      {
        "product": {...},
        "position": 0,
        "isPinned": true,
        "isFeatured": true,
        "customNote": "Best seller - keep at top"
      }
    ]
  }
}
```

**Sorting:** Automatically sorted (pinned first, then by position)

---

### **2. Reorder Products (Drag & Drop)**

```http
PUT /api/sections/:id/priorities/reorder
```

**Request Body:**
```json
{
  "productOrder": [
    { "productId": "product_1", "position": 0 },
    { "productId": "product_2", "position": 1 },
    { "productId": "product_3", "position": 2 }
  ]
}
```

**Use Case:** After drag-and-drop in UI, send new positions

---

### **3. Pin/Unpin Product**

```http
PUT /api/sections/:id/priorities/:productId/pin
```

**Response:**
```json
{
  "success": true,
  "message": "Product pinned to top",
  "data": {
    "productId": "...",
    "isPinned": true,
    "section": {...}
  }
}
```

**Behavior:** Toggle pin status. Pinned products always appear first.

---

### **4. Feature/Unfeature Product**

```http
PUT /api/sections/:id/priorities/:productId/feature
```

**Response:**
```json
{
  "success": true,
  "message": "Product marked as featured",
  "data": {
    "productId": "...",
    "isFeatured": true,
    "section": {...}
  }
}
```

**Use Case:** Highlight special products with badges/styling

---

### **5. Move Product to Specific Position**

```http
PUT /api/sections/:id/priorities/:productId/move
```

**Request Body:**
```json
{
  "newPosition": 3
}
```

**Behavior:** 
- Moves product to exact position
- Automatically shifts other products
- Maintains sort order

**Example:**
```
Before: [A(0), B(1), C(2), D(3), E(4)]
Move C to position 4
After:  [A(0), B(1), D(2), E(3), C(4)]
```

---

### **6. Update Product Priority Settings**

```http
PUT /api/sections/:id/priorities/:productId
```

**Request Body:**
```json
{
  "position": 2,
  "isPinned": true,
  "isFeatured": false,
  "customNote": "Seasonal promotion product"
}
```

**Use Case:** Update all priority fields at once

---

### **7. Get Pinned Products Only**

```http
GET /api/sections/:id/priorities/pinned
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "product": {...}, "isPinned": true, "position": 0 },
    { "product": {...}, "isPinned": true, "position": 1 }
  ]
}
```

---

### **8. Get Featured Products Only**

```http
GET /api/sections/:id/priorities/featured
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "product": {...}, "isFeatured": true, "position": 1 }
  ]
}
```

---

### **9. Bulk Update Priorities**

```http
PUT /api/sections/:id/priorities/bulk
```

**Request Body:**
```json
{
  "updates": [
    {
      "productId": "product_1",
      "position": 0,
      "isPinned": true,
      "isFeatured": true
    },
    {
      "productId": "product_2",
      "position": 1,
      "customNote": "New arrival"
    },
    {
      "productId": "product_3",
      "isFeatured": false
    }
  ]
}
```

**Use Case:** Efficient batch updates for multiple products

---

## 🎨 Display Logic

### **Frontend Rendering Order**

```javascript
// Products are returned already sorted by:
// 1. Pinned products (isPinned: true)
// 2. Then by position (ascending)

// Example response order:
[
  { isPinned: true,  position: 5 },  // ← Shown first
  { isPinned: true,  position: 8 },  // ← Second
  { isPinned: false, position: 0 },  // ← Third
  { isPinned: false, position: 1 },  // ← Fourth
]
```

### **Visual Indicators**

```jsx
// Example React component
{products.map(item => (
  <ProductCard
    key={item.product._id}
    product={item.product}
    isPinned={item.isPinned}
    isFeatured={item.isFeatured}
    customNote={item.customNote}
  />
))}

// ProductCard styling
<div className={`
  ${item.isPinned ? 'border-blue-500 border-2' : ''}
  ${item.isFeatured ? 'bg-yellow-50' : ''}
`}>
  {item.isPinned && <Badge>Pinned</Badge>}
  {item.isFeatured && <Badge>Featured</Badge>}
</div>
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Drag and Drop**

```bash
# Initial order
GET /api/sections/:id/priorities
# Products: [A, B, C, D, E]

# User drags C to position 0
PUT /api/sections/:id/priorities/reorder
{
  "productOrder": [
    { "productId": "C", "position": 0 },
    { "productId": "A", "position": 1 },
    { "productId": "B", "position": 2 },
    { "productId": "D", "position": 3 },
    { "productId": "E", "position": 4 }
  ]
}

# New order: [C, A, B, D, E]
```

### **Scenario 2: Pin Important Product**

```bash
# Pin product to top
PUT /api/sections/:id/priorities/:productId/pin

# Even if position is 10, pinned products show first
# Order: [Pinned Products...] [Regular Products...]
```

### **Scenario 3: Feature Multiple Products**

```bash
# Mark products as featured
PUT /api/sections/:id/priorities/bulk
{
  "updates": [
    { "productId": "product_1", "isFeatured": true },
    { "productId": "product_2", "isFeatured": true },
    { "productId": "product_3", "isFeatured": true }
  ]
}

# Frontend can show badges or special styling
```

### **Scenario 4: Move Product**

```bash
# Move product from position 5 to position 1
PUT /api/sections/:id/priorities/:productId/move
{
  "newPosition": 1
}

# System automatically shifts:
# Position 1 → 2
# Position 2 → 3
# Position 3 → 4
# Position 4 → 5
# Position 5 → 1
```

---

## 🎯 Use Cases

### **1. Seasonal Promotions**

```bash
# Pin seasonal products to top
PUT /api/sections/:id/priorities/bulk
{
  "updates": [
    {
      "productId": "winter_coat_1",
      "isPinned": true,
      "isFeatured": true,
      "customNote": "Winter sale - end of season"
    }
  ]
}
```

### **2. Best Sellers**

```bash
# Feature best-selling products
PUT /api/sections/:id/priorities/:productId/feature
# Add "Featured" badge in frontend
```

### **3. New Arrivals Section**

```bash
# Create section
POST /api/sections
{
  "name": { "en": "New Arrivals" },
  "products": [...]
}

# Set newest products at top
PUT /api/sections/:id/priorities/reorder
{
  "productOrder": [
    { "productId": "newest", "position": 0 },
    { "productId": "new", "position": 1 },
    ...
  ]
}
```

### **4. Clearance Items**

```bash
# Move clearance to bottom
PUT /api/sections/:id/priorities/:productId/move
{
  "newPosition": 99
}
```

---

## 🔧 Migration from Old System

### **Automatic Migration**

The system automatically migrates old sections:

```typescript
// Pre-save hook in Section model
if (this.products.length > 0 && this.productPriorities.length === 0) {
  this.productPriorities = this.products.map((productId, index) => ({
    product: productId,
    position: index,
    isPinned: false,
    isFeatured: false,
  }));
}
```

**Behavior:**
- Old sections work without changes
- First save auto-converts to new format
- `products` array kept for backward compatibility

---

## 📊 Database Queries

### **Get Sections with Ordered Products**

```javascript
const section = await Section.findById(sectionId)
  .populate({
    path: 'productPriorities.product',
    select: 'name slug images basePrice variants'
  });

// Products already sorted by model virtual
const ordered = section.orderedProducts;
```

### **Find Sections with Featured Products**

```javascript
const sections = await Section.find({
  'productPriorities.isFeatured': true
});
```

### **Count Pinned Products**

```javascript
const section = await Section.findById(sectionId);
const pinnedCount = section.productPriorities.filter(p => p.isPinned).length;
```

---

## 🎨 Frontend Integration Examples

### **React Drag-and-Drop**

```jsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function ProductList({ sectionId, products }) {
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Create new order
    const productOrder = items.map((item, index) => ({
      productId: item.product._id,
      position: index
    }));

    // Update backend
    await fetch(`/api/sections/${sectionId}/priorities/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ productOrder })
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="products">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {products.map((item, index) => (
              <Draggable
                key={item.product._id}
                draggableId={item.product._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ProductCard product={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

### **Pin/Feature Toggles**

```jsx
function ProductControls({ sectionId, productId, isPinned, isFeatured }) {
  const togglePin = async () => {
    await fetch(`/api/sections/${sectionId}/priorities/${productId}/pin`, {
      method: 'PUT'
    });
    // Refresh data
  };

  const toggleFeature = async () => {
    await fetch(`/api/sections/${sectionId}/priorities/${productId}/feature`, {
      method: 'PUT'
    });
    // Refresh data
  };

  return (
    <div>
      <button onClick={togglePin}>
        {isPinned ? '📌 Unpin' : '📌 Pin'}
      </button>
      <button onClick={toggleFeature}>
        {isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
      </button>
    </div>
  );
}
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Products Not Sorting Correctly**

**Solution:**
```javascript
// Always use the orderedProducts virtual
const section = await Section.findById(id);
const products = section.orderedProducts; // ✅ Correct
// NOT: section.productPriorities // ❌ Wrong
```

### **Issue 2: Position Conflicts**

**Problem:** Multiple products with same position

**Solution:**
```javascript
// Use bulk update to fix
PUT /api/sections/:id/priorities/bulk
{
  "updates": products.map((p, i) => ({
    productId: p.product._id,
    position: i
  }))
}
```

### **Issue 3: Pinned Products Not at Top**

**Check:** Frontend sorting logic

```javascript
// Correct sorting
products.sort((a, b) => {
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  return a.position - b.position;
});
```

---

## ✅ Best Practices

### **1. Use Bulk Updates for Multiple Changes**

```javascript
// ❌ Bad: Multiple requests
for (const update of updates) {
  await updatePriority(update);
}

// ✅ Good: Single bulk request
await bulkUpdatePriorities(updates);
```

### **2. Keep Positions Sequential**

```javascript
// ✅ Good: 0, 1, 2, 3, 4
// ❌ Bad:  0, 5, 10, 22, 100

// Re-normalize after changes
const normalized = products.map((p, i) => ({
  ...p,
  position: i
}));
```

### **3. Limit Pinned Products**

```javascript
// Don't pin too many products
const MAX_PINNED = 3;

if (pinnedCount >= MAX_PINNED) {
  alert('Maximum 3 pinned products allowed');
  return;
}
```

### **4. Use Custom Notes Wisely**

```javascript
// ✅ Good notes
"Black Friday sale - expires 11/30"
"Low stock - reorder soon"
"Best seller in Q4 2025"

// ❌ Bad notes
"aslkdjf"
""
"Product"
```

---

## 📈 Performance Considerations

### **Indexing**

```javascript
// No additional indexes needed
// Virtual properties calculate on-the-fly
```

### **Population**

```javascript
// Efficient: Populate only needed fields
.populate({
  path: 'productPriorities.product',
  select: 'name slug images basePrice'
})

// Inefficient: Populate everything
.populate('productPriorities.product')
```

---

## ✅ Stage 7 Complete Checklist

- [x] Product priority model implemented
- [x] Drag-and-drop reordering API
- [x] Pin to top functionality
- [x] Featured product system
- [x] Position movement logic
- [x] Bulk update endpoint
- [x] Get pinned/featured endpoints
- [x] Backward compatibility maintained
- [x] Auto-migration from old format
- [x] Swagger documentation
- [x] Virtual properties for sorting

---

## 🎯 Summary

**Stage 7 provides complete control over product display order within sections:**

✅ **Flexible Ordering** - Drag-and-drop, move to position, bulk updates
✅ **Priority System** - Pin important products, feature special items
✅ **Admin Notes** - Track reasoning for product placement
✅ **Backward Compatible** - Old sections auto-migrate
✅ **Performance Optimized** - Efficient queries, minimal overhead

**Ready for Production!** 🚀