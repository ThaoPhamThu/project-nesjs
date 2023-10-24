import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { async } from 'rxjs';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>) { }


  async create(createResumeCvDto: CreateResumeCvDto, @User() user: IUser) {
    const { url, companyId, jobId } = createResumeCvDto
    return await this.resumeModel.create({
      email: user.email,
      userId: user._id,
      url,
      status: 'PENDING',
      companyId, jobId,
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ],
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    let { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let skip = (+currentPage - 1) * (+limit);
    let defaultlimit = (+limit) ? (+limit) : 10;
    let totalItems = ((await this.resumeModel.find(filter)).length);
    let totalPage = Math.ceil(totalItems / defaultlimit);

    const results = await this.resumeModel.find(filter)
      .skip(skip)
      .limit(defaultlimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPage,
        total: totalItems
      },
      results
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resumes')
    }

    return await this.resumeModel.findOne({ _id: id });
  }

  async findByUsers(@User() user: IUser) {
    return await this.resumeModel.find({
      userId: user._id
    })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: { name: 1 }
        },
        {
          path: 'jobId',
          select: { name: 1 }
        }
      ])
  }

  async update(id: string, status: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resumes')
    }

    const updated = await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      });
    return updated;
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resumes')
    }

    let updateDelete = await this.resumeModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })

    return await this.resumeModel.softDelete({ _id: id })
  }
}
