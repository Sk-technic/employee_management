import { UserRole } from "src/auth/schema/user.schema";

export class UserDto {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  teamLeadId:string | null
}