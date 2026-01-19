import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserRole } from "src/auth/schema/user.schema";
import { UserDto } from "../dto/User.res.dto";


@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.userModel
            .findById(id)
            .select('-password -refreshToken')
            .lean();

        if (!user) throw new NotFoundException('user not found');

        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            teamLeadId: user.teamLeadId?.toString() || null
        };
    }

    async addNewTL(id: string): Promise<{ status: string }> {
        const NewTL = await this.userModel.findByIdAndUpdate(id, { role: UserRole.TEAM_LEAD }, { new: true })
        if (!NewTL) throw new NotFoundException("user not found");
        return { status: "ok" }
    }

    async assignTL(empId: string, tlId: string):Promise<{name:string,TL:string}>{
        const employee = await this.userModel.findById(empId);
        if (!employee) throw new NotFoundException('Employee not found');

        if (employee.role !== UserRole.EMPLOYEE) {
            throw new BadRequestException('User is not an employee');
        }

        const teamLead = await this.userModel.findById(tlId);
        if (!teamLead) throw new NotFoundException('Team lead not found');

        if (teamLead.role !== UserRole.TEAM_LEAD) {
            throw new BadRequestException('User is not a team lead');
        }

        employee.teamLeadId = teamLead._id;

        await employee.save();

        return {
            name:employee.name,
            TL:employee.teamLeadId.toString()
        };
    }


}