import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrackingStatus } from '../enums/tracking-status.enum';
import { TrackingType } from '../enums/tracking-type.enum';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Mission } from 'src/missions/entities/mission.entity';

registerEnumType(TrackingStatus, {
  name: 'TrackingStatus',
});

@Entity('tracking')
@ObjectType()
export class Tracking {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  currentPlace: string;

  @Field(() => TrackingStatus)
  @Column({
    type: 'enum',
    enum: TrackingStatus,
    default: TrackingStatus.PENDING,
  })
  status: TrackingStatus;

  @Field(() => TrackingStatus)
  @Column({
    type: 'enum',
    enum: TrackingType,
  })
  type: TrackingType;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.tracking, { nullable: true })
  delivery: User;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order: Order) => order.tracking, { nullable: true })
  order: Order;

  @Field(() => Mission, { nullable: true })
  @ManyToOne(() => Mission, (mission: Mission) => mission.tracking, {
    nullable: true,
  })
  mission: Mission;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
