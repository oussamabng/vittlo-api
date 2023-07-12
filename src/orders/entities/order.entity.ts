import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Double,
  OneToMany,
} from 'typeorm';
import {
  Field,
  Float,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryFees } from '../enums/delivery-fees.enum';
import { User } from 'src/users/entities/user.entity';
import { Mission } from 'src/missions/entities/mission.entity';
import { Tracking } from 'src/tracking/entities/tracking.entity';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

registerEnumType(DeliveryFees, {
  name: 'DeliveryFees',
});

@Entity('order')
@ObjectType()
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ nullable: true })
  productName: string;

  @Field(() => String)
  @Column({ nullable: true })
  senderFullName: string;

  @Field(() => String)
  @Column({ nullable: true })
  senderPhoneNumber: string;

  @Field(() => Float)
  @Column({ nullable: true })
  productPrice: number;

  @Field(() => String)
  @Column({ nullable: true })
  shippingAddress: string;

  @Field(() => Float)
  @Column({ nullable: true, type: 'real' })
  destinationLat: string;

  @Field(() => Float)
  @Column({ nullable: true, type: 'real' })
  destinationLong: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.orders)
  delivery: User;

  @Field(() => [Tracking], { nullable: true })
  @OneToMany(() => Tracking, (tracking: Tracking) => tracking.order)
  tracking: Tracking[];

  @Field(() => DeliveryFees)
  @Column({
    type: 'enum',
    enum: DeliveryFees,
    default: DeliveryFees.EXPRESS,
  })
  deliveryFees: DeliveryFees;

  @Field(() => String)
  @Column({ nullable: true })
  trackingCode: string;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field(() => Mission, { nullable: true })
  @ManyToOne(() => Mission, (mission: Mission) => mission.orders)
  mission: Mission;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
