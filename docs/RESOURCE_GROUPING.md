# Resource Grouping Configuration

Starting with version 1.0.1, velos-ts provides flexible configuration options for grouping API endpoints into repositories.

## Overview

By default, velos-ts intelligently groups related endpoints into a single repository. For example:
- `/api/v1/orders`
- `/api/v1/orders/{id}`
- `/api/v1/orders/{id}/items`

All these endpoints will be grouped into one `OrderRepository` by default.

## Configuration Options

### Basic Configuration

Add resource grouping configuration to your `velos.config.ts`:

```typescript
import { defineConfig } from 'velos-ts';

export default defineConfig({
  openApiSpecPath: './openapi.yaml',
  outputDir: './src/generated',
  apiSpecTypesPath: './src/generated/api-types.ts',

  resourceGrouping: {
    depth: 1,        // Number of path segments to use for grouping
    strategy: 'auto' // Grouping strategy: 'root' | 'full' | 'auto'
  }
});
```

### Grouping Strategies

#### 1. Auto Strategy (Default)

**Strategy**: `'auto'`
**Behavior**: Intelligently groups sub-resources under root based on path parameters

```typescript
resourceGrouping: {
  strategy: 'auto',
  depth: 1
}
```

**Examples**:
- `/api/v1/orders` → `OrderRepository`
- `/api/v1/orders/{id}` → `OrderRepository`
- `/api/v1/orders/{id}/items` → `OrderRepository` (sub-resource grouped with root)
- `/api/v1/admin/products` → `AdminRepository` (depth=1)

**Use when**: You want sub-resources (endpoints after path parameters) grouped with their parent resource.

#### 2. Root Strategy

**Strategy**: `'root'`
**Behavior**: Always uses only the first segment after version

```typescript
resourceGrouping: {
  strategy: 'root'
}
```

**Examples**:
- `/api/v1/orders` → `OrderRepository`
- `/api/v1/orders/{id}/items` → `OrderRepository`
- `/api/v1/admin/products` → `AdminRepository`

**Use when**: You want maximum grouping - all endpoints starting with the same root path in one repository.

#### 3. Full Strategy

**Strategy**: `'full'`
**Behavior**: Creates separate repositories for all path segments

```typescript
resourceGrouping: {
  strategy: 'full'
}
```

**Examples**:
- `/api/v1/orders` → `OrderRepository`
- `/api/v1/orders/{id}/items` → `OrderItemRepository` (separate repo!)
- `/api/v1/admin/products` → `AdminProductRepository`

**Use when**: You want fine-grained control with separate repositories for nested resources.

### Depth Configuration

The `depth` parameter controls how many path segments to use for grouping (only applies to paths without parameters in auto mode).

#### Depth = 1 (Default)

```typescript
resourceGrouping: {
  depth: 1,
  strategy: 'auto'
}
```

**Examples**:
- `/api/v1/admin/products` → `AdminRepository` (only 1 segment used)
- `/api/v1/orders` → `OrderRepository`

#### Depth = 2

```typescript
resourceGrouping: {
  depth: 2,
  strategy: 'auto'
}
```

**Examples**:
- `/api/v1/admin/products` → `AdminProductRepository` (2 segments used)
- `/api/v1/orders` → `OrderRepository`

#### Depth = 3

```typescript
resourceGrouping: {
  depth: 3,
  strategy: 'auto'
}
```

**Examples**:
- `/api/v1/admin/users/roles` → `AdminUserRoleRepository` (3 segments used)

## Common Use Cases

### Use Case 1: Microservice with Simple Resources

**Scenario**: You have a simple API with resources like `/api/v1/users`, `/api/v1/products`

**Configuration**:
```typescript
resourceGrouping: {
  strategy: 'auto',  // Default
  depth: 1           // Default
}
```

### Use Case 2: Admin Panel with Grouped Resources

**Scenario**: You have grouped resources like `/api/v1/admin/users`, `/api/v1/admin/products`

**Configuration**:
```typescript
resourceGrouping: {
  strategy: 'auto',
  depth: 2  // Include the 'admin' prefix in resource name
}
```

**Result**:
- `AdminUserRepository` with all `/api/v1/admin/users/**` endpoints
- `AdminProductRepository` with all `/api/v1/admin/products/**` endpoints

### Use Case 3: RESTful API with Nested Resources

**Scenario**: You have nested resources like `/api/v1/orders/{id}/items`

**Configuration**:
```typescript
resourceGrouping: {
  strategy: 'auto'  // Default: groups sub-resources with parent
}
```

**Result**:
- `OrderRepository` includes both `/api/v1/orders` and `/api/v1/orders/{id}/items`

### Use Case 4: Separate Repositories for Everything

**Scenario**: You want maximum separation and fine-grained control

**Configuration**:
```typescript
resourceGrouping: {
  strategy: 'full'
}
```

**Result**:
- `/api/v1/orders` → `OrderRepository`
- `/api/v1/orders/{id}/items` → `OrderItemRepository`
- `/api/v1/users/{id}/profile` → `UserProfileRepository`

## Generated Repository Examples

### Auto Strategy (Default)

With default configuration, this OpenAPI spec:

```yaml
paths:
  /api/v1/orders:
    get: { ... }
    post: { ... }
  /api/v1/orders/{id}:
    get: { ... }
  /api/v1/orders/{id}/items:
    get: { ... }
    post: { ... }
```

Generates **one repository**:

```typescript
// OrderRepository.ts
export class OrderRepository extends BaseRepository<OrderDTO> {
  async getAllOrders(): Promise<Result<Page<OrderDTO>>> { ... }
  async createOrder(data: CreateOrderRequest): Promise<Result<OrderDTO>> { ... }
  async getOrderById(id: number): Promise<Result<OrderDTO>> { ... }
  async getOrderItems(orderId: number): Promise<Result<OrderItemDTO[]>> { ... }
  async addOrderItem(orderId: number, item: OrderItemRequest): Promise<Result<OrderItemDTO>> { ... }
}
```

### Full Strategy

With `strategy: 'full'`, the same spec generates **two repositories**:

```typescript
// OrderRepository.ts
export class OrderRepository extends BaseRepository<OrderDTO> {
  async getAllOrders(): Promise<Result<Page<OrderDTO>>> { ... }
  async createOrder(data: CreateOrderRequest): Promise<Result<OrderDTO>> { ... }
  async getOrderById(id: number): Promise<Result<OrderDTO>> { ... }
}

// OrderItemRepository.ts
export class OrderItemRepository extends BaseRepository<OrderItemDTO> {
  async getOrderItems(orderId: number): Promise<Result<OrderItemDTO[]>> { ... }
  async addOrderItem(orderId: number, item: OrderItemRequest): Promise<Result<OrderItemDTO>> { ... }
}
```

## Migration from Previous Versions

If you're upgrading from v1.0.0, the default behavior now groups sub-resources more aggressively. If you want the old behavior:

```typescript
// Old behavior: separate repos for nested resources
resourceGrouping: {
  strategy: 'full'
}
```

## Best Practices

1. **Start with defaults**: The `auto` strategy with `depth: 1` works well for most APIs
2. **Use depth for namespacing**: If you have `/admin/*` or `/public/*` prefixes, use `depth: 2`
3. **Use full strategy sparingly**: Only when you truly need separate repositories for each nested resource
4. **Be consistent**: Choose one strategy and stick with it across your project

## See Also

- [Main Documentation](../README.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Examples](../examples/)
