import { IsMongoId } from 'class-validator';

export class ProductIdParamDto {
  @IsMongoId()
  declare id: string;
}
