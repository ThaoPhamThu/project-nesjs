import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';
import { async } from 'rxjs';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }

  async create(createPermissionDto: CreatePermissionDto, @User() user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto;

    const isExist = await this.permissionModel.findOne({ apiPath, method });
    if (isExist) {
      throw new BadRequestException('Permisstion với apiPath=${Path}, method=${method}')
    }

    return await this.permissionModel.create({
      name, apiPath, method, module,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const skip = (+currentPage - 1) * (+limit);
    const defaultlimit = (+limit) ? (+limit) : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPage = Math.ceil(totalItems / defaultlimit);

    const result = await this.permissionModel.find(filter)
      .sort(sort as any)
      .skip(skip)
      .limit(defaultlimit)
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
      result
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found permission')
    }

    return await this.permissionModel.findOne({ _id: id });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found permission')
    }

    const { module, method, apiPath, name } = updatePermissionDto;
    return await this.permissionModel.updateOne({ _id: id },
      {
        module, method, apiPath, name,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found permission')
    }

    const deleteUpdate = await this.permissionModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })

    return await this.permissionModel.softDelete({ _id: id })
  }
}
