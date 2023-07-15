import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SearchDto } from 'src/users/dto/search-dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/users/guards/admin.guard';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AdminGuard)
  @Mutation(() => Order)
  createOrder(@Args('input') createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(AdminGuard)
  @Query(() => ResponseOrderDto, { name: 'orders' })
  findAll(
    @Args('pagination') paginationDto: PaginationDto,
    @Args('search') searchDto: SearchDto,
  ) {
    return this.ordersService.findAll(paginationDto, searchDto);
  }

  @UseGuards(AdminGuard)
  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Order, { name: 'addOrderToMission' })
  addOrderToMission(
    @Args('missionId', { type: () => Int }) missionId: number,
    @Args('orderId', { type: () => Int }) orderId: number,
  ) {
    return this.ordersService.addOrderToMission(missionId, orderId);
  }
}
