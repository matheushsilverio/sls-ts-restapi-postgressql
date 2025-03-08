import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
  UseCase,
  executeParamsType,
} from '../../shared/interfaces/usecase.interface';
import OrderRepository from '../../shared/repositories/orderRepository';
import {
  badRequest,
  notFoundResponse,
  successResponse,
} from '../../shared/api-gateway-response';

export default class DeleteOrderUseCase implements UseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(
    params: executeParamsType,
  ): Promise<APIGatewayProxyStructuredResultV2> {
    const { pathParameters } = params;

    const orderId = pathParameters?.orderId;

    if (!orderId) {
      return badRequest('OrderId is required');
    }

    const order = await this.orderRepository.getById(orderId);

    if (!order) {
      return notFoundResponse(
        `Order with ID ${orderId} not found, try with another ID`,
      );
    }

    await this.orderRepository.delete(orderId);

    return successResponse({ message: 'Order deleted successfully' });
  }
}
