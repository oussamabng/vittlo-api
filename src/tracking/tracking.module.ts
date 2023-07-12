import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingResolver } from './tracking.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Mission } from 'src/missions/entities/mission.entity';
import { Tracking } from './entities/tracking.entity';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Mission, Tracking])],
  controllers: [TrackingController],
  providers: [TrackingResolver, TrackingService],
})
export class TrackingModule {}
