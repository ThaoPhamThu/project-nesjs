import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, SubscriberDocument } from './Schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { async } from 'rxjs';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) { }

  async create(createSubscriberDto: CreateSubscriberDto, @User() user: IUser) {
    const { email, name, skills } = createSubscriberDto;

    const isExist = await this.subscriberModel.findOne({ email: email });
    if (isExist) {
      throw new BadRequestException('Email: ${email} đã tồn tại');
    };

    const newSubs = await this.subscriberModel.create({
      email, name, skills,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newSubs?._id,
      createdAt: newSubs?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const skip = (+currentPage - 1) * (+limit);
    const defaultlimit = (+limit) ? (+limit) : 10;
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultlimit);

    const result = await this.subscriberModel.find(filter)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .sort(sort as any)
      .select(projection as any)
      .exec()

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found subscriber')
    }
    return await this.subscriberModel.findOne({ _id: id });
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, @User() user: IUser) {
    const updated = await this.subscriberModel.updateOne({ email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true }
    );
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resumes')
    };

    await this.subscriberModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return await this.subscriberModel.softDelete({ _id: id })
  }

  async getSkills(@User() user: IUser) {
    const { email } = user;
    return await this.subscriberModel.findOne({ email: email }, { skills: 1 })
  }
}
