import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsResolver } from './missions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Mission } from './entities/mission.entity';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { MissionsController } from './missions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Mission, Tracking])],
  controllers: [MissionsController],
  providers: [MissionsResolver, MissionsService],
})
export class MissionsModule {}
