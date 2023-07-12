import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { MissionStatus } from '../enums/mission-status.enum';
import { OptimalRouteDto } from '../dto/create-mission.dto';
import { Tracking } from 'src/tracking/entities/tracking.entity';

registerEnumType(MissionStatus, {
  name: 'MissionStatus',
});

@Entity('missions')
@ObjectType()
export class Mission {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.missions, { nullable: true })
  delivery: User;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order: Order) => order.mission, { nullable: true })
  orders: Order[];

  @Field(() => [Tracking], { nullable: true })
  @OneToMany(() => Tracking, (tracking: Tracking) => tracking.mission)
  tracking: Tracking[];

  @Field(() => MissionStatus)
  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.PENDING,
  })
  status: MissionStatus;

  @Field(() => Number)
  get numberOfOrders(): number {
    return this.orders ? this.orders.length : 0;
  }

  @Field(() => String, { nullable: true })
  get startingAdress() {
    return this.orders?.length > 0 ? this.orders[0].shippingAddress : null;
  }

  @Field(() => String, { nullable: true })
  get endingAdress() {
    return this.orders?.length > 0
      ? this.orders?.slice(-1)[0]?.shippingAddress
      : null;
  }

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
