import { describe, it, expect } from 'vitest';
import { OrderStatus } from '../types';

describe('FuelTrack Order Progression State Machine', () => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    ORDER_VERIFIED: ['TANKER_ASSIGNED', 'CANCELLED'],
    TANKER_ASSIGNED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['DISPENSING', 'CANCELLED'],
    DISPENSING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: []
  };

  function canTransition(current: OrderStatus, next: OrderStatus): boolean {
    return validTransitions[current]?.includes(next) || false;
  }

  it('should follow the 6-step linear delivery lifecycle', () => {
    expect(canTransition('ORDER_VERIFIED', 'TANKER_ASSIGNED')).toBe(true);
    expect(canTransition('TANKER_ASSIGNED', 'IN_TRANSIT')).toBe(true);
    expect(canTransition('IN_TRANSIT', 'ARRIVED')).toBe(true);
    expect(canTransition('ARRIVED', 'DISPENSING')).toBe(true);
    expect(canTransition('DISPENSING', 'COMPLETED')).toBe(true);
  });

  it('should forbid illegal skipping transitions', () => {
    expect(canTransition('ORDER_VERIFIED', 'COMPLETED')).toBe(false);
    expect(canTransition('ORDER_VERIFIED', 'DISPENSING')).toBe(false);
    expect(canTransition('COMPLETED', 'ORDER_VERIFIED')).toBe(false);
    expect(canTransition('DISPENSING', 'ORDER_VERIFIED')).toBe(false);
  });

  it('should allow cancellation before dispensing starts', () => {
    expect(canTransition('ORDER_VERIFIED', 'CANCELLED')).toBe(true);
    expect(canTransition('TANKER_ASSIGNED', 'CANCELLED')).toBe(true);
    expect(canTransition('IN_TRANSIT', 'CANCELLED')).toBe(true);
    expect(canTransition('ARRIVED', 'CANCELLED')).toBe(true);
    // Cannot cancel once active dispensing is underway
    expect(canTransition('DISPENSING', 'CANCELLED')).toBe(false);
  });
});
