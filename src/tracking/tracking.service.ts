import { Injectable } from '@nestjs/common';
import { CreateTrackingInput } from './dto/create-tracking.input';
import { UpdateTrackingInput } from './dto/update-tracking.input';
import { Tracking } from './entities/tracking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TrackingService {
  constructor(@InjectRepository(Tracking) private repo: Repository<Tracking>) {}
  create(createTrackingInput: CreateTrackingInput) {
    return 'This action adds a new tracking';
  }

  findAll() {
    return `This action returns all tracking`;
  }

  async getOrderTracking(order_id: number) {
    const orderTracking = await this.repo.find({
      where: {
        order: {
          id: order_id,
        },
      },
      relations: ['order', 'mission', 'delivery', 'mission.orders'],
      //'order.mission','order.mission.delivery'
      order: {
        createdAt: 'ASC',
      },
    });

    return orderTracking;
  }

  async getOrderTrackingByCode(trackingCode: string) {
    const orderTracking = await this.repo.find({
      where: {
        order: {
          trackingCode,
        },
      },
      relations: ['order', 'mission', 'delivery', 'mission.orders'],
      //'order.mission','order.mission.delivery'
      order: {
        createdAt: 'ASC',
      },
    });

    return orderTracking;
  }

  findOne(id: number) {
    return `This action returns a #${id} tracking`;
  }

  update(id: number, updateTrackingInput: UpdateTrackingInput) {
    return `This action updates a #${id} tracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} tracking`;
  }
}
