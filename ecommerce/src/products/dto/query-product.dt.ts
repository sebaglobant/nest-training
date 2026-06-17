import { IsOptional, IsPositive, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @Type(() => String)
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString({ each: true })
  @IsOptional()
  category?: string;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  page?: number;
  
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  limit?: number;

  @Type(() => String)
  @IsOptional()
  @IsString()
  location?: string;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(0)
  minPrice?: number;
  
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  sortBy?: string;
  
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';


}
