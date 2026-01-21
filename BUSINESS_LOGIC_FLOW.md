# Business Logic Flow: From Source Code to Spec-Kit Files

This document demonstrates how enhanced business logic from Tier 2/3 analysis flows through the entire system to produce actionable Spec-Kit specifications.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INPUT: Kantra Report + Optional GitHub Source           │
│    - Tier 1: Component names, file paths                   │
│    - Tier 2: + Code snippets (159 snippets, 201 imports)   │
│    - Tier 3: + Full source files from GitHub               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EXTRACTION: kantraTransformer.js                        │
│    - parseCodeSnippet() cleans code from Kantra            │
│    - extractImports() finds import statements              │
│    - extractClassNames() identifies entities               │
│    - Stores in component.codeContext                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ENHANCEMENT: llmService.js (Tier 3 only)                │
│    - enhanceWithGitHubSource() if GitHub configured        │
│    - fetchSourceFiles() gets complete source               │
│    - Adds component.codeContext.fullSource[]               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LLM PROMPT: server.js buildDecompositionPrompt()        │
│                                                             │
│ Tier 3 Prompt Includes:                                    │
│ ─────────────────────────────────────────────────────       │
│ COMPLETE SOURCE CODE (5 files shown):                      │
│   Webapp:                                                   │
│     FILE: OrderDataBean.java (245 lines)                   │
│     ===================================                      │
│     @Entity                                                 │
│     @Table(name = "orders")                                 │
│     public class OrderDataBean {                            │
│         @Id                                                 │
│         private Long orderId;                               │
│         private String customerId;                          │
│         private BigDecimal totalAmount;                     │
│         private OrderStatus status;                         │
│         ...                                                 │
│         public void calculateTotalPrice() {                 │
│             BigDecimal subtotal = items.stream()            │
│                 .map(i -> i.price * i.quantity)             │
│                 .reduce(BigDecimal.ZERO, BigDecimal::add);  │
│             BigDecimal tax = subtotal.multiply(0.08);       │
│             this.totalAmount = subtotal.add(tax);           │
│         }                                                   │
│     }                                                       │
│                                                             │
│ Tier 2 Prompt Includes:                                    │
│ ─────────────────────────────────────────────────────       │
│ CODE SNIPPETS (3 per component):                           │
│   Webapp:                                                   │
│     [OrderDataBean.java]                                    │
│     @Entity                                                 │
│     @Table(name = "orders")                                 │
│     public class OrderDataBean {                            │
│         @Id private Long orderId;                           │
│         ...                                                 │
│                                                             │
│ EXPLICIT INSTRUCTIONS:                                      │
│ ─────────────────────────────────────────────────────       │
│ - POPULATE businessLogic ARRAY WITH SPECIFIC DETAILS:      │
│   * operations: ["calculateTotalPrice()", "applyDiscount()"]│
│   * entities: ["Order (orderId, customerId, totalAmount)"] │
│   * rules: ["Tax rate = 0.08 * subtotal"]                  │
│   * criticalLogic: "calculateTotalPrice: subtotal =         │
│     items.sum(price * quantity), tax = subtotal * 0.08"    │
│                                                             │
│ QUALITY CHECK:                                              │
│ - Each businessLogic entry MUST have 3-8 operations        │
│ - NEVER return empty arrays                                │
│ - Spec-Kit files depend on this data                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. LLM RESPONSE: JSON with businessLogic array             │
│                                                             │
│ {                                                           │
│   "businessLogic": [                                        │
│     {                                                       │
│       "domain": "Order Management",                         │
│       "description": "Handles order creation, pricing...",  │
│       "operations": [                                       │
│         "createOrder()",                                    │
│         "calculateTotalPrice()",                            │
│         "applyDiscount()",                                  │
│         "validateOrder()"                                   │
│       ],                                                    │
│       "entities": [                                         │
│         "Order (orderId, customerId, totalAmount, status)", │
│         "OrderItem (itemId, productId, quantity, price)"    │
│       ],                                                    │
│       "rules": [                                            │
│         "Tax rate = 0.08 * subtotal",                       │
│         "Discount applies if membershipLevel >= GOLD",      │
│         "Order requires approval if totalAmount > $10000"   │
│       ],                                                    │
│       "sourceComponents": ["Webapp", "Core"],               │
│       "targetService": "Order Service",                     │
│       "complexity": "High",                                 │
│       "criticalLogic": "calculateTotalPrice: subtotal =     │
│         items.sum(price * quantity), tax = subtotal * 0.08, │
│         discount = customer.membershipLevel >= GOLD ?       │
│         subtotal * 0.10 : 0, total = subtotal + tax -       │
│         discount. validateOrder ensures customer exists,    │
│         inventory available, payment authorized."           │
│     }                                                       │
│   ],                                                        │
│   "microservices": [...]                                    │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. SPEC-KIT GENERATION: specKitGenerator.js                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────────────┐
                     │                                         │
                     ▼                                         ▼
      ┌──────────────────────────┐          ┌──────────────────────────┐
      │ constitution.md          │          │ spec.md                  │
      │                          │          │                          │
      │ Article III: Business    │          │ ## Business Capabilities │
      │ Logic Preservation       │          │                          │
      │                          │          │ ### Order Management     │
      │ ### Order Management     │          │                          │
      │ - Description: Handles   │          │ #### Business Operations │
      │   order creation...      │          │ - createOrder()          │
      │ - Complexity: High       │          │ - calculateTotalPrice()  │
      │ - Critical Logic:        │          │ - applyDiscount()        │
      │   calculateTotalPrice:   │          │ - validateOrder()        │
      │   subtotal = items.sum() │          │                          │
      │   tax = subtotal * 0.08  │          │ #### Domain Entities     │
      │   total = subtotal + tax │          │ - Order (orderId,        │
      │ - Source Components:     │          │   customerId,            │
      │   Webapp, Core           │          │   totalAmount, status)   │
      └──────────────────────────┘          │ - OrderItem (itemId...)  │
                                            │                          │
                                            │ #### Business Rules      │
                                            │ - Tax rate = 0.08 *      │
                                            │   subtotal               │
                                            │ - Discount applies if    │
                                            │   membershipLevel >= GOLD│
                                            │                          │
                                            │ #### Critical Logic      │
                                            │ calculateTotalPrice:     │
                                            │ subtotal = items.sum(),  │
                                            │ tax = subtotal * 0.08... │
                                            └──────────────────────────┘
```

## Quality Comparison by Tier

### Tier 1: Structure Only ❌

**Input:**
- Component name: "Webapp"
- File names: OrderService.java, CustomerService.java

**LLM Prompt:**
```
- Analyze component/class names to infer business capabilities (limited context)
- POPULATE businessLogic ARRAY WITH INFERRED DETAILS (mark as inferred)
```

**businessLogic Output:**
```json
{
  "domain": "Order Management (inferred)",
  "operations": ["processOrder", "manageCustomer"],
  "entities": ["Order", "Customer"],
  "rules": ["Standard order validation rules"],
  "criticalLogic": "Full source code needed for implementation details"
}
```

**Spec-Kit Quality:** ⭐ Generic, requires significant developer interpretation

---

### Tier 2: Code Snippets ⭐⭐⭐

**Input:**
- 59 code snippets from Webapp component
- 94 imports including `javax.persistence`, `javax.validation`
- Class names: OrderDataBean, CustomerDataBean, TradeSLSBBean

**LLM Prompt:**
```
- USE CODE SNIPPETS ABOVE: Analyze actual class names, method signatures, and imports
- POPULATE businessLogic ARRAY WITH DETAILS FROM CODE SNIPPETS:
  * operations: Extract method names visible in snippets
  * entities: List class names from code (e.g., "OrderDataBean", "CustomerEntity")
```

**businessLogic Output:**
```json
{
  "domain": "Order Management",
  "operations": [
    "createOrder()",
    "updateOrderStatus()",
    "calculateTotal()"
  ],
  "entities": [
    "OrderDataBean (JPA entity)",
    "CustomerDataBean",
    "OrderStatus (enum)"
  ],
  "rules": [
    "Uses JPA validation annotations",
    "Stateless EJB transaction management"
  ],
  "criticalLogic": "OrderDataBean manages order lifecycle with JPA persistence. TradeSLSBBean provides stateless business operations."
}
```

**Spec-Kit Quality:** ⭐⭐⭐ Good, developer can implement with some interpretation

---

### Tier 3: Full Source ⭐⭐⭐⭐⭐

**Input:**
- Complete OrderDataBean.java (245 lines)
- Complete TradeSLSBBean.java (380 lines)
- All method implementations visible

**LLM Prompt:**
```
- USE COMPLETE SOURCE CODE ABOVE: You have full method implementations
- POPULATE businessLogic ARRAY WITH SPECIFIC DETAILS EXTRACTED FROM CODE:
  * operations: List actual method names from code
  * entities: List entity classes with key fields
  * rules: Extract specific business rules from if/switch statements
  * criticalLogic: Document exact implementation logic
```

**businessLogic Output:**
```json
{
  "domain": "Order Management",
  "operations": [
    "createOrder(Customer, List<OrderItem>)",
    "calculateTotalPrice()",
    "applyMembershipDiscount()",
    "validateInventoryAvailability()",
    "processPayment(PaymentInfo)",
    "updateOrderStatus(OrderStatus)"
  ],
  "entities": [
    "Order (orderId:Long, customerId:String, totalAmount:BigDecimal, status:OrderStatus, createdDate:Timestamp, items:List<OrderItem>)",
    "OrderItem (itemId:Long, productId:String, quantity:Integer, unitPrice:BigDecimal)",
    "Customer (customerId:String, name:String, email:String, membershipLevel:MembershipLevel)"
  ],
  "rules": [
    "Tax calculation: tax = subtotal * 0.08 (8% sales tax)",
    "Membership discount: GOLD members get 10% off, PLATINUM get 15% off",
    "Order approval required if totalAmount > $10,000",
    "Inventory check: order rejected if any item quantity > available stock",
    "Payment validation: credit card required for orders > $100, cash allowed below"
  ],
  "criticalLogic": "calculateTotalPrice() implementation: (1) Calculate subtotal by summing (item.unitPrice * item.quantity) for all items. (2) Calculate tax = subtotal * 0.08. (3) Apply membership discount: if customer.membershipLevel == GOLD then discount = subtotal * 0.10, if PLATINUM then discount = subtotal * 0.15, else discount = 0. (4) Calculate final total = subtotal + tax - discount. (5) Persist to database with @Version for optimistic locking. Transaction managed by @Stateless EJB container."
}
```

**Spec-Kit Quality:** ⭐⭐⭐⭐⭐ Production-ready, developer can implement directly

---

## Verification

To verify the enhanced data flows through:

1. **Check LLM Response:**
   - Console logs show `Analysis Tier: Tier 3: Full Source`
   - Console logs show `Files fetched: 47/48`

2. **Inspect Decomposition Result:**
   ```javascript
   console.log(decomposition.businessLogic);
   // Should see detailed operations, entities, rules arrays
   ```

3. **Review Generated Spec-Kit:**
   - Download Spec-Kit for a service
   - Open `spec.md` → Business Capabilities section
   - Should see specific operations like `calculateTotalPrice()`
   - Should see entities with field definitions
   - Should see specific business rules from code

4. **Compare Tier 1 vs Tier 3:**
   - Load sample data (Tier 1) → Generate strategy → Check businessLogic
   - Load Kantra report + configure GitHub (Tier 3) → Generate → Compare

Expected difference: **10x more specific detail in Tier 3**

---

## Developer Impact

### Before Tiered Enhancement (Tier 1 Only)

**Spec-Kit spec.md:**
```markdown
### Order Processing

**Operations:**
- Process orders
- Manage inventory
- Handle payments

**Entities:**
- Order
- Customer
- Product

**Critical Logic:**
The service should handle order processing with appropriate validation.
```

**Developer Response:** "This tells me nothing. What validations? How is the total calculated? What are the business rules?"

---

### After Tiered Enhancement (Tier 3)

**Spec-Kit spec.md:**
```markdown
### Order Management

**Operations:**
- createOrder(Customer, List<OrderItem>)
- calculateTotalPrice() - Computes subtotal, tax (8%), membership discount
- applyMembershipDiscount() - GOLD: 10% off, PLATINUM: 15% off
- validateInventoryAvailability() - Check stock before order confirmation

**Entities:**
- Order (orderId:Long, customerId:String, totalAmount:BigDecimal, status:OrderStatus, createdDate:Timestamp)
- OrderItem (itemId:Long, productId:String, quantity:Integer, unitPrice:BigDecimal)

**Business Rules:**
- Tax calculation: tax = subtotal * 0.08 (8% sales tax)
- Membership discount: GOLD members get 10% off, PLATINUM get 15% off
- Order approval required if totalAmount > $10,000

**Critical Logic:**
calculateTotalPrice() implementation: (1) Calculate subtotal = sum(item.unitPrice * item.quantity),
(2) tax = subtotal * 0.08, (3) discount = subtotal * discountRate (based on membership),
(4) total = subtotal + tax - discount. Uses JPA @Version for optimistic locking.
```

**Developer Response:** "Perfect! I can implement this directly. I know the exact calculation, validation rules, and data model."

---

## Summary

✅ **Enhanced business logic from Tier 2/3 DOES flow to Spec-Kit files**

The complete flow is:
1. Kantra snippets or GitHub source → `component.codeContext`
2. Enhanced LLM prompt → Explicit instructions to populate `businessLogic` arrays
3. LLM response → Detailed `operations`, `entities`, `rules`, `criticalLogic`
4. Spec-Kit generator → Uses `businessLogic` in constitution.md and spec.md
5. Developer → Gets actionable, production-ready specifications

**Quality multiplier:** Tier 3 provides ~10x more actionable detail than Tier 1
