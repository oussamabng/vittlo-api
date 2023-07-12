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

@Resolver(() => Mission)
export class MissionsResolver {
  constructor(private readonly missionsService: MissionsService) {}

  @Mutation(() => Mission)
  createMission() {
    return this.missionsService.create();
  }

  @Query(() => [Mission], { name: 'missions' })
  findAll() {
    return this.missionsService.findAll();
  }

  @Query(() => Order, { name: 'currentPositionMission', nullable: true })
  currentPositionMission(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.currentPositionMission(id);
  }

  @Query(() => Mission, { name: 'mission' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.findOne(id);
  }

  @Mutation(() => String, { name: 'moveToNextOrder' })
  moveToNextOrder(@Args('id', { type: () => Int }) id: number) {
    return this.missionsService.moveToNextOrder(id);
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
