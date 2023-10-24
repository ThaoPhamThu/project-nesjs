import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { async } from 'rxjs';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { use } from 'passport';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }


  async create(createJobDto: CreateJobDto, @User() user: IUser) {
    const { name, skills, company, salary, quantity, level, description, startDate, endDate, isActive, location } = createJobDto;
    const job = await this.jobModel.create({
      name,
      skills,
      company, salary, quantity,
      level,
      description,
      location,
      startDate, endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return job;

  }

  async findAll(currentPage: number, limit: number, qs: string, @User() user: IUser) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const skip = (+currentPage - 1) * (+limit);
    const defaultlimit = (+limit) ? (+limit) : 10;
    const totalItems = ((await this.jobModel.find(filter)).length);
    const totalPage = Math.ceil(totalItems / defaultlimit);

    const result = await this.jobModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as any)
      .populate(population)
      .exec()

    return {
      meta: {
        current: currentPage,
        pageSize: defaultlimit,
        pages: totalPage,
        total: totalItems
      },
      result
    }

  }

  async findOne(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found job')
    }

    return await this.jobModel.findOne({ _id: id })
  }

  async update(id: string, updateJobDto: UpdateJobDto, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found job')
    }

    let newJob = await this.jobModel.updateOne({ _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return newJob;
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found job')
    }

    await this.jobModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    });
    return await this.jobModel.softDelete({ _id: id })
  }
}
