import { Knex } from 'knex';
import { Order } from '../models/orderModel';
import db from '../database/knex-client';

export default class OrderRepository {
  private tableName = 'orders';

  constructor(private knex: Knex = db) {}

  async create(order: Order): Promise<Order> {
    const [createdOrder] = await this.knex(this.tableName)
      .insert(order)
      .returning('*');

    return createdOrder;
  }

  async getById(orderId: string): Promise<Order | null> {
    return await this.knex(this.tableName).where({ orderId }).first();
  }

  async getByUserId(userId: string): Promise<Order[]> {
    return await this.knex(this.tableName).where({ userId }).select('*');
  }

  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    const [updatedOrder] = await this.knex(this.tableName)
      .where({ orderId })
      .update({ status, updatedAt: this.knex.fn.now() })
      .returning('*');

    return updatedOrder;
  }

  async delete(orderId: string): Promise<void> {
    await this.knex(this.tableName).where({ orderId }).delete();
  }
}
