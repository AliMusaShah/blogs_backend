import { Transform } from "class-transformer";
import { trim, trimLower } from "../../common/transforms.js";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @Transform(trimLower)
    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72) // bcrypt ignores everything after 72 bytes
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
        message: 'password must contain at least one letter and one number',
    })
    password: string;
}
