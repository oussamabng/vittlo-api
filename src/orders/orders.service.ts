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
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { DeliveryFees } from './enums/delivery-fees.enum';

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
    const agentCkpt = path.join(__dirname, '../..', 'src', 'model.ckpt');
    const tf = {
      evaluate: async (_: any, ordersFiltered: any, numVehicles: number) => {
        const file = path.join(__dirname, '../..', 'src', 'agent');

        const options = {
          pythonPath: 'python3',
          scriptPath: file,
          args: [numVehicles.toString(), JSON.stringify(ordersFiltered)],
        };

        const data = await PythonShell.run('vrp.py', options);

        const dataString: string = data.join(' ');
        const sections = dataString
          .split('--route--')
          .map((section) => section.trim());

        sections.shift();

        return sections;
      },
    };
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

    const ordersFiltered = await this.repo
      .createQueryBuilder('orders')
      .select([
        'orders.destinationLat AS lat',
        'orders.destinationLong AS long',
        'orders.shippingAddress AS name',
        'orders.id AS wilayanumber',
      ])
      .where('orders.status = :status', { status: OrderStatus.PENDING })
      .getRawMany();

    //check if number of PENDING orders is 5
    if (ordersFiltered.length >= 5) {
      const numVehicles = 1;

      //pass to vrp agent
      const data = await tf.evaluate(agentCkpt, ordersFiltered, numVehicles);

      await Promise.all(
        data.map(async (section, index) => {
          const sectionArray = section.split(',');
          const array = sectionArray[0].split('==');
          array.shift();
          array.pop();
          console.log('array ', array);
          const mission = this.repoMissions.create({ orders: [] });
          await this.repoMissions.save(mission);

          const orderPromises = array.map(async (item) => {
            const [name, lat, long, id] = item.split('+');
            const order = this.repo.findOne({
              where: {
                id: parseInt(id.trim()),
              },
            });
            return order;
          });
          const orders = await Promise.all(orderPromises);

          for (let i = 0; i < orders.length; i++) {
            if (orders[i]) {
              orders[i].status = OrderStatus.IN_PROGRESS;
              orders[i].position = i + 1;
              await this.repo.save(orders[i]);
              const tracking = this.repoTracking.create({
                type: TrackingType.ORDER,
                order: orders[i],
                status: TrackingStatus.IN_PROGRESS,
              });

              await this.repoTracking.save(tracking);
            }
          }
          mission.orders = orders;
          await this.repoMissions.save(mission);

          const trackingMission = this.repoTracking.create({
            type: TrackingType.MISSION,
            mission: mission,
            currentPlace: orders[0]?.shippingAddress,
          });
          await this.repoTracking.save(trackingMission);
        }),
      );
    }

    return order;
  }

  async createMultipleOrders() {
    const wilayaData = [
      { lat: 35.698822, long: -0.63887435, name: 'Oran', wilayanumber: 17 },
      { lat: 36.47004, long: 2.8277, name: 'Blida', wilayanumber: 18 },
      {
        name: 'Ain Temouchent',
        wilayanumber: 46,
        lat: 35.30661476829141,
        long: -1.1328402209200905,
      },
      {
        name: 'Sidi Bel Abbès',
        wilayaNumber: 22,
        lat: 35.21231741768364,
        long: -0.6268997608592823,
      },
      /*    {
        name: 'Tlemcen',
        wilayanumber: 13,
        lat: 34.88478069154205,
        long: -1.3201439737862923,
      }, */
    ];

    await Promise.all(
      wilayaData.map(async (wilaya) => {
        const order = await this.create({
          productName: 'name',
          productPrice: 1000,
          deliveryFees: DeliveryFees.MEDIUM_DISTANCE,
          destinationLat: wilaya.lat.toString(),
          destinationLong: wilaya.long.toString(),
          shippingAddress: wilaya.name,
          senderFullName: 'name',
          senderPhoneNumber: '0541523275',
        });
        await this.repo.save(order);
      }),
    );

    return 'CREATED';
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
        createdAt: 'DESC',
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
