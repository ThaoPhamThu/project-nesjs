import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './Schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/soft-delete-model';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import { async } from 'rxjs';
import { error } from 'console';
import mongoose from 'mongoose';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }
  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const company = this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return company;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let skip = (+currentPage - 1) * (+limit);
    let defaultlimit = +limit ? +limit : 10;

    const totalItems = ((await this.companyModel.find(filter)).length);
    const totalPage = Math.ceil(totalItems / defaultlimit);

    const result = await this.companyModel.find(filter)
      .skip(skip)
      .limit(defaultlimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPage,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found company')
    }

    return await this.companyModel.findOne({ _id: id })
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found company')
    }

    return this.companyModel.updateOne({ _id: id }, {
      ...updateCompanyDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found company')
    }

    await this.companyModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.companyModel.softDelete({ _id: id });
  }
}
