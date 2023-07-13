import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SearchDto } from 'src/users/dto/search-dto';
import { Mission } from 'src/missions/entities/mission.entity';
import { OrderStatus } from './enums/order-status.enum';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { TrackingType } from 'src/tracking/enums/tracking-type.enum';
import { TrackingStatus } from 'src/tracking/enums/tracking-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(Mission) private repoMissions: Repository<Mission>,
    @InjectRepository(Tracking) private repoTracking: Repository<Tracking>,
  ) {}

  async findOne(id: number) {
    const order = await this.repo.findOne({
      where: { id },
      relations: ['delivery', 'mission'],
    });

    if (!order) {
      throw new NotFoundException('Order not found ');
    }
    return order;
  }

  generateUniqueCode(): string {
    const prefix = 'VIT-';
    const randomChars = randomBytes(3).toString('hex').toUpperCase();

    return prefix + randomChars;
  }

  async create({
    productName,
    productPrice,
    deliveryFees,
    destinationLat,
    destinationLong,
    shippingAddress,
    senderFullName,
    senderPhoneNumber,
  }: CreateOrderDto) {
    const order = this.repo.create({
      productName,
      productPrice,
      deliveryFees,
      destinationLat,
      destinationLong,
      shippingAddress,
      senderFullName,
      senderPhoneNumber,
      trackingCode: this.generateUniqueCode(),
    });
    await this.repo.save(order);

    const tracking = this.repoTracking.create({
      type: TrackingType.ORDER,
      order: order,
    });
    await this.repoTracking.save(tracking);

    const orders = await this.repo.find({
      where: { status: OrderStatus.PENDING },
    });

    //check if number of PENDING orders is 10
    if (orders.length >= 3) {
      //if so create a mission and assign the orders to it
      const mission = this.repoMissions.create({});
      mission.orders = orders;
      await this.repoMissions.save(mission);

      //create the tracking mission that an mission is created
      const trackingMission = this.repoTracking.create({
        type: TrackingType.MISSION,
        mission: mission,
        currentPlace: orders[0]?.shippingAddress,
      });
      await this.repoTracking.save(trackingMission);

      //assign all that last 5 orders to the same mission , and create a tracking status that they were added to a mission
      await Promise.all(
        orders.map(async (order) => {
          const tracking = this.repoTracking.create({
            type: TrackingType.ORDER,
            order: order,
            status: TrackingStatus.IN_PROGRESS,
          });
          await this.repoTracking.save(tracking);

          order.mission = mission;
          order.status = OrderStatus.IN_PROGRESS;
          await this.repo.save(order);
        }),
      );
    }

    return order;
  }

  async findAll({ page, limit }: PaginationDto, { keyword }: SearchDto) {
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await this.repo.findAndCount({
      skip,
      take: limit,
      where: [
        {
          productName: ILike(`%${keyword}%`),
        },
      ],
      relations: ['mission', 'mission.delivery'],
      order: {
        createdAt: 'ASC',
      },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    return {
      items: orders,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage,
    };
  }

  async addOrderToMission(missionId: number, orderId: number) {
    const order = await this.findOne(orderId);
    const mission = await this.repoMissions.findOne({
      where: { id: missionId },
      relations: ['delivery', 'orders'],
    });
    if (!mission) {
      throw new NotFoundException('Mission not found ');
    }

    order.mission = mission;
    mission.orders.push(order);

    await this.repo.save(order);
    await this.repoMissions.save(mission);

    return order;
  }
}
