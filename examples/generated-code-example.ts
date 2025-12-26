/**
 * Example: Generated Repository Code
 *
 * This shows what the generated repository code looks like
 * with response code documentation for frontend developers.
 */

//@ts-nocheck

import type { Result, RequestOptions } from 'velos-ts/runtime';
import { BaseRepository } from 'velos-ts/runtime';

// Type aliases generated from OpenAPI schemas
export type OrderDTO = components['schemas']['OrderDTO'];
export type CreateOrderRequest = components['schemas']['CreateOrderRequest'];
export type UpdateOrderRequest = components['schemas']['UpdateOrderRequest'];
export type Page<T> = components['schemas']['Page'] & { content: T[] };

/**
 * Repository for Order operations
 */
export class OrderRepository extends BaseRepository<OrderDTO> {
  protected readonly endpoint = '/api/v1/orders';

  /**
   * Get all orders with pagination
   *
   * **Response Codes:**
   * - `200`: Successfully retrieved orders
   * - `401`: Unauthorized - Authentication required
   * - `403`: Forbidden - Insufficient permissions
   *
   * @async
   */
  async getAllOrders(
    queryParams?: GetAllOrdersQueryParams,
    options?: RequestOptions
  ): Promise<Result<Page<OrderDTO>>> {
    try {
      const response = await this.apiClient.get<Page<OrderDTO>>(
        `${this.endpoint}`,
        queryParams as unknown as Record<string, unknown>,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }

  /**
   * Get order by ID
   *
   * **Response Codes:**
   * - `200`: Successfully retrieved order
   * - `401`: Unauthorized - Authentication required
   * - `404`: Order not found
   *
   * @async
   */
  async getOrderById(id: number, options?: RequestOptions): Promise<Result<OrderDTO>> {
    try {
      const response = await this.apiClient.get<OrderDTO>(
        `${this.endpoint}/${id}`,
        undefined,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }

  /**
   * Create a new order
   *
   * **Response Codes:**
   * - `201`: Order created successfully
   * - `400`: Bad request - Invalid input data
   * - `401`: Unauthorized - Authentication required
   * - `409`: Conflict - Order already exists
   * - `422`: Unprocessable entity - Validation failed
   *
   * @async
   */
  async createOrder(
    data: CreateOrderRequest,
    options?: RequestOptions
  ): Promise<Result<OrderDTO>> {
    try {
      const response = await this.apiClient.post<OrderDTO>(
        `${this.endpoint}`,
        data,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }

  /**
   * Update an existing order
   *
   * **Response Codes:**
   * - `200`: Order updated successfully
   * - `400`: Bad request - Invalid input data
   * - `401`: Unauthorized - Authentication required
   * - `403`: Forbidden - Cannot update this order
   * - `404`: Order not found
   * - `422`: Unprocessable entity - Validation failed
   *
   * @async
   */
  async updateOrder(
    id: number,
    data: UpdateOrderRequest,
    options?: RequestOptions
  ): Promise<Result<OrderDTO>> {
    try {
      const response = await this.apiClient.put<OrderDTO>(
        `${this.endpoint}/${id}`,
        data,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }

  /**
   * Delete an order
   *
   * **Response Codes:**
   * - `204`: Order deleted successfully
   * - `401`: Unauthorized - Authentication required
   * - `403`: Forbidden - Cannot delete this order
   * - `404`: Order not found
   * - `409`: Conflict - Order has dependencies
   *
   * @async
   */
  async deleteOrder(id: number, options?: RequestOptions): Promise<Result<void>> {
    try {
      const response = await this.apiClient.delete<void>(
        `${this.endpoint}/${id}`,
        undefined,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }

  /**
   * Cancel an order
   *
   * **Response Codes:**
   * - `200`: Order cancelled successfully
   * - `400`: Bad request - Order cannot be cancelled in current state
   * - `401`: Unauthorized - Authentication required
   * - `404`: Order not found
   * - `409`: Conflict - Order already cancelled or completed
   *
   * @async
   */
  async cancelOrder(id: number, options?: RequestOptions): Promise<Result<OrderDTO>> {
    try {
      const response = await this.apiClient.post<OrderDTO>(
        `${this.endpoint}/${id}/cancel`,
        undefined,
        {},
        { ...options, requiresAuth: true }
      );
      return success(response);
    } catch (error) {
      return failure(errorToDetails(error, 'API_ERROR'));
    }
  }
}

// ==============================================================================
// Benefits for Frontend Developers
// ==============================================================================

/**
 * With the response codes documented, frontend developers can:
 *
 * 1. **Handle specific errors gracefully:**
 */
async function handleOrderCreation() {
  const orderRepo = new OrderRepository(apiClient);
  const result = await orderRepo.createOrder(orderData);

  if (result.success) {
    // 201: Show success message
    showToast('Order created successfully', 'success');
    router.push('/orders/' + result.data.id);
  } else {
    // Handle specific error cases based on status code
    const statusCode = result.error.details?.statusCode;

    switch (statusCode) {
      case 400:
        // Bad request - Show validation errors
        showToast('Please check your input', 'error');
        displayValidationErrors(result.error.details?.errors);
        break;

      case 401:
        // Unauthorized - Redirect to login
        showToast('Please login to continue', 'warning');
        router.push('/login');
        break;

      case 409:
        // Conflict - Order already exists
        showToast('This order already exists', 'warning');
        break;

      case 422:
        // Validation failed - Show specific field errors
        showToast('Please fix the following errors', 'error');
        displayFieldErrors(result.error.details?.validationErrors);
        break;

      default:
        // Unknown error
        showToast('An error occurred. Please try again.', 'error');
    }
  }
}

/**
 * 2. **Build better UI/UX based on expected responses:**
 */
function OrderCreateButton() {
  const handleSubmit = async () => {
    setLoading(true);
    const result = await orderRepo.createOrder(formData);

    if (!result.success) {
      // JSDoc told us to expect: 400, 401, 409, 422
      // We can prepare UI for each case

      if (result.error.details?.statusCode === 409) {
        // Show "Order already exists - view existing order?" dialog
        setShowExistingOrderDialog(true);
      }
    }

    setLoading(false);
  };

  return <button onClick={handleSubmit}>Create Order</button>;
}

/**
 * 3. **Write better tests:**
 */
describe('OrderRepository.createOrder', () => {
  it('should handle 201 Created response', async () => {
    // From JSDoc: expects 201 on success
    mockApiClient.post.mockResolvedValue(mockOrder);

    const result = await orderRepo.createOrder(validOrder);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockOrder);
  });

  it('should handle 400 Bad Request', async () => {
    // From JSDoc: expects 400 for invalid input
    mockApiClient.post.mockRejectedValue({
      status: 400,
      message: 'Invalid input data',
    });

    const result = await orderRepo.createOrder(invalidOrder);

    expect(result.success).toBe(false);
    expect(result.error.details?.statusCode).toBe(400);
  });

  it('should handle 409 Conflict', async () => {
    // From JSDoc: expects 409 when order already exists
    mockApiClient.post.mockRejectedValue({
      status: 409,
      message: 'Order already exists',
    });

    const result = await orderRepo.createOrder(duplicateOrder);

    expect(result.success).toBe(false);
    expect(result.error.details?.statusCode).toBe(409);
  });
});

/**
 * 4. **Document expected behavior in comments:**
 */
// When calling createOrder, expect one of:
// - 201: Success
// - 400: Fix validation errors and retry
// - 401: User needs to login
// - 409: Order already exists, don't retry
// - 422: Show field-specific validation errors

export { handleOrderCreation, OrderCreateButton };
