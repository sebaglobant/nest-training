import {
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare name: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare category: string;

    @Type(() => Number)
    @IsDefined()
    @IsPositive()
    declare price: number;

    @Type(() => String)
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare location: string;

    @Type(() => Number)
    @IsDefined()
    @IsInt()
    @Min(0)
    declare stock: number;
}
