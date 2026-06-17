import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product {
  declare _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  declare name: string;

  @Prop({ default: 'Uncategorized', index: true })
  declare category: string;

  @Prop({ required: true })
  declare price: number;
  
  @Prop({ required: true })
  declare location: string;

  @Prop({ required: true })
  declare stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);