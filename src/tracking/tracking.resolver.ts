import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { TrackingService } from './tracking.service';
import { Tracking } from './entities/tracking.entity';

@Resolver(() => Tracking)
export class TrackingResolver {
  constructor(private readonly trackingService: TrackingService) {}

  @Query(() => [Tracking], { name: 'tracking' })
  findAll() {
    return this.trackingService.findAll();
  }

  @Query(() => [Tracking], { name: 'orderTracking' })
  getOrderTracking(@Args('order_id', { type: () => Int }) order_id: number) {
    return this.trackingService.getOrderTracking(order_id);
  }

  @Query(() => [Tracking], { name: 'getOrderTrackingByCode' })
  getOrderTrackingByCode(
    @Args('trackingCode', { type: () => String }) trackingCode: string,
  ) {
    return this.trackingService.getOrderTrackingByCode(trackingCode);
  }

  @Query(() => Tracking, { name: 'tracking' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.trackingService.findOne(id);
  }
}
