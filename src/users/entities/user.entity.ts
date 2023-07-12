import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enums/user-role.dto';
import { UserStatus } from '../enums/user-status.dto';
import {
  Field,
  HideField,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import { Mission } from 'src/missions/entities/mission.entity';
import { Tracking } from 'src/tracking/entities/tracking.entity';

registerEnumType(UserRole, {
  name: 'UserRole',
});

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

@Entity('user')
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @HideField()
  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.DELIVERY })
  role: UserRole;

  @Field(() => UserStatus)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phoneNumber: string;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order: Order) => order.delivery)
  orders: Order[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  adress: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  carModel: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  licensePlate: string;

  @HideField()
  @Column({ nullable: true })
  otp: string;

  @HideField()
  @Column({ nullable: true })
  otpCodeExpireDate: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  carColor: string;

  @Field(() => [Mission], { nullable: true })
  @OneToMany(() => Mission, (mission: Mission) => mission.delivery)
  missions: Mission[];

  @Field(() => [Tracking], { nullable: true })
  @OneToMany(() => Tracking, (tracking: Tracking) => tracking.delivery)
  tracking: Tracking[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
