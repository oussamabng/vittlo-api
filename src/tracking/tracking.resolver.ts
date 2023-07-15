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
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/users/guards/admin.guard';

@Resolver(() => Tracking)
export class TrackingResolver {
  constructor(private readonly trackingService: TrackingService) {}

  @UseGuards(AdminGuard)
  @Query(() => [Tracking], { name: 'tracking' })
  findAll() {
    return this.trackingService.findAll();
  }

  @UseGuards(AdminGuard)
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

  @UseGuards(AdminGuard)
  @Query(() => Tracking, { name: 'tracking' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.trackingService.findOne(id);
  }
}
