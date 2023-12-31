import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
} from '@nestjs/graphql';
import { MissionsService } from './missions.service';
import { Mission } from './entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { ResponseMissionDto } from './dto/response-missions.dto';
import { Order } from 'src/orders/entities/order.entity';
import { SearchDto } from 'src/users/dto/search-dto';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { DeliveryGuard } from 'src/users/guards/delivery.guard';
import { CurrentUserId } from 'src/users/interceptors/current-user-id.decorator';
import { Double } from 'typeorm';
import { LatLongDto } from './dto/lat-long.dto';

@Resolver(() => Mission)
export class MissionsResolver {
  constructor(private readonly missionsService: MissionsService) {}

  /*   @Mutation(() => Mission)
  createMission() {
    return this.missionsService.create();
  } */

  @UseGuards(AdminGuard)
  @Query(() => ResponseMissionDto, { name: 'paginatedMissions' })
  findAll(
    @Args('pagination') paginationDto: PaginationDto,
    @Args('search') searchDto: SearchDto,
  ) {
    return this.missionsService.findAll(paginationDto, searchDto);
  }

  @UseGuards(DeliveryGuard)
  @Query(() => [Mission], { name: 'missions' })
  missions() {
    return this.missionsService.missions();
  }

  @Query(() => Order, { name: 'currentPositionMission', nullable: true })
  currentPositionMission(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.currentPositionMission(id);
  }

  @Query(() => Mission, { name: 'mission' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.findOne(id);
  }

  @UseGuards(DeliveryGuard)
  @Mutation(() => String, { name: 'moveToNextOrder' })
  moveToNextOrder(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.moveToNextOrder(id);
  }

  @UseGuards(DeliveryGuard)
  @Query(() => Mission, { name: 'getActualMission' })
  getActualMission(@CurrentUserId() userId: number) {
    return this.missionsService.getActualMission(userId);
  }

  @UseGuards(DeliveryGuard)
  @Query(() => LatLongDto)
  origin(@CurrentUserId() userId: number) {
    return this.missionsService.origin(userId);
  }

  @Query(() => String)
  analytics(@CurrentUserId() userId: number) {
    return this.missionsService.analytics(userId);
  }

  @UseGuards(DeliveryGuard)
  @Query(() => LatLongDto)
  destination(@CurrentUserId() userId: number) {
    return this.missionsService.destination(userId);
  }

  @UseGuards(DeliveryGuard)
  @Query(() => Boolean)
  missionHadFinishedOrders(@CurrentUserId() userId: number) {
    return this.missionsService.missionHadFinishedOrders(userId);
  }

  /*   @Mutation(() => Mission)
  updateMission(
    @Args('updateMissionInput') updateMissionInput: UpdateMissionInput,
  ) {
    return this.missionsService.update(
      updateMissionInput.id,
      updateMissionInput,
    );
  }

  @Mutation(() => Mission)
  removeMission(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.remove(id);
  } */
}
