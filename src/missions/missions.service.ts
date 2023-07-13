import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMissionDto, OptimalRouteDto } from './dto/create-mission.dto';
import { Mission } from './entities/mission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { ResponseMissionDto } from './dto/response-missions.dto';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { MissionStatus } from './enums/mission-status.enum';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { TrackingType } from 'src/tracking/enums/tracking-type.enum';
import { TrackingStatus } from 'src/tracking/enums/tracking-status.enum';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SearchDto } from 'src/users/dto/search-dto';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private repo: Repository<Mission>,
    @InjectRepository(Tracking) private repoTracking: Repository<Tracking>,
    @InjectRepository(Order) private repoOrders: Repository<Order>,
  ) {}

  async create() {
    const mission = this.repo.create();
    await this.repo.save(mission);

    return mission;
  }

  async missions() {
    const missions = await this.repo.find({
      relations: ['delivery', 'orders', 'tracking'],
      order: {
        orders: {
          createdAt: 'ASC',
        },
        tracking: {
          createdAt: 'ASC',
        },
      },
    });

    return missions;
  }

  async findAll({ page, limit }: PaginationDto, { keyword }: SearchDto) {
    const skip = (page - 1) * limit;

    const [missions, totalCount] = await this.repo.findAndCount({
      skip,
      take: limit,
      where: [
        {
          delivery: {
            email: ILike(`%${keyword}%`),
          },
        },
      ],
      relations: ['delivery', 'orders', 'tracking'],
      order: {
        orders: {
          createdAt: 'ASC',
        },
        tracking: {
          createdAt: 'ASC',
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    return {
      items: missions,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} mission`;
  }

  async currentPositionMission(id: number) {
    const mission = await this.repo.findOne({
      where: { id },
    });

    if (!mission) {
      throw new BadRequestException('Mission not found');
    }

    const orders = await this.repoOrders.find({
      where: {
        mission: {
          id: mission?.id,
        },
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return orders?.length > 0 ? orders[0] : null;
  }

  async moveToNextOrder(id: number) {
    const mission = await this.repo.findOne({
      where: { id },
    });
    if (!mission) {
      throw new BadRequestException('Mission not found');
    }

    const orders = await this.repoOrders.find({
      where: {
        mission: {
          id: mission?.id,
        },
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (orders.length > 0) {
      const orderDone = orders[0];
      orderDone.status = OrderStatus.DELIVERED;
      this.repoOrders.save(orderDone);
      //add tracking order
      const tracking = this.repoTracking.create({
        type: TrackingType.ORDER,
        order: orderDone,
        status: TrackingStatus.DELIVERED,
        currentPlace: orderDone.shippingAddress,
      });
      await this.repoTracking.save(tracking);

      //add tracking mission
      const trackingMission = this.repoTracking.create({
        type: TrackingType.MISSION,
        mission: mission,
        status: TrackingStatus.IN_PROGRESS,
        currentPlace: orderDone.shippingAddress,
      });
      await this.repoTracking.save(trackingMission);
    } else if (mission.status !== MissionStatus.COMPLETED) {
      mission.status = MissionStatus.COMPLETED;
      this.repo.save(mission);

      //add tracking
      const tracking = this.repoTracking.create({
        type: TrackingType.MISSION,
        mission: mission,
        status: TrackingStatus.DELIVERED,
      });
      await this.repoTracking.save(tracking);
    }

    return 'Success';
  }

  /*   update(id: number, updateMissionInput: UpdateMissionInput) {
    return `This action updates a #${id} mission`;
  }

  remove(id: number) {
    return `This action removes a #${id} mission`;
  } */
}
