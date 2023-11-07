import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/soft-delete-model';
import { async } from 'rxjs';
import { IUser } from './user.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  getHashPassword = (password: string) => {
    let salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const { name, email, password, age, gender, address, role, company } = createUserDto;
    const isExist = await this.userModel.findOne({ email: email })
    if (isExist) {
      throw new BadRequestException('Email ${email} đã tồn tại. Vui lòng sử dụng email khác')
    }
    let hashPassword = this.getHashPassword(password);
    let newUser = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      age,
      gender, address,
      role, company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    const isExist = await this.userModel.findOne({ email: email })
    if (isExist) {
      throw new BadRequestException('Email ${email} đã tồn tại. Vui lòng sử dụng email khác')
    }

    //fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id
    });
    return newRegister
  }

  async findAll(currentPage: number, limit: number, qs: string, @User() user: IUser) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const skip = (+currentPage - 1) * (+limit);
    const defaultlimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItems / defaultlimit);

    const result = await this.userModel.find(filter)
      .skip(skip)
      .limit(defaultlimit)
      .sort(sort as any)
      .select("-password")
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
      throw new BadRequestException('not found user')
    }

    return await this.userModel.findOne({ _id: id })
      .select("-password")
      .populate({ path: 'role', select: { name: 1, _id: 1 } })

  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username })
      .populate({ path: 'role', select: { name: 1 } });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
  };

  async update(updateUserDto: UpdateUserDto, @User() user: IUser) {
    const { _id, name, email, age, gender, address, role, company } = updateUserDto;
    let updateUser = await this.userModel.updateOne({ _id: updateUserDto._id }, {
      ...updateUserDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return updateUser;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id: _id }, { refreshToken })
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
      .populate({
        path: 'role',
        select: { name: 1 }
      })
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found user')
    }

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin@gmail.com')
    }

    await this.userModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    });
    return this.userModel.softDelete({ _id: id });
  };


}
