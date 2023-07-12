import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Mission } from 'src/missions/entities/mission.entity';
import { Tracking } from 'src/tracking/entities/tracking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Mission, Tracking])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
