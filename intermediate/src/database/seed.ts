import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Product, ProductDocument } from '../products/schemas/product.schema';

const GEMMA_URL = process.env.GEMMA_URL ?? 'http://localhost:8082';
const SEED_COUNT = Number(process.env.SEED_COUNT ?? 20);
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE ?? 5);

const schemaBlueprint = {
  name: 'string (realistic product name)',
  category: 'string (e.g. Electronics, Groceries, Apparel, Home, Toys)',
  price: 'number (realistic price in USD, 2 decimals)',
  location: 'string (warehouse city, e.g. "Austin, TX")',
  stock: 'integer (units in stock, 0-500)',
};

async function generateBatch(count: number) {
  const prompt = `Generate an array of exactly ${count} realistic product objects matching this blueprint:
${JSON.stringify(schemaBlueprint)}

Respond with a JSON object: {"products": [...]}`;

  const res = await fetch(`${GEMMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma-2b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    throw new Error(`gemma request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content?.trim() ?? '';
  console.log('Raw response from gemma:', raw);
  const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/g, '');
  const parsed = JSON.parse(jsonText) as { products: Array<Record<string, unknown>> };
  return parsed.products;
}

async function generateProducts(count: number) {
  const products: Array<Record<string, unknown>> = [];
  while (products.length < count) {
    const remaining = Math.min(BATCH_SIZE, count - products.length);
    console.log(`Generating batch of ${remaining}...`);
    products.push(...(await generateBatch(remaining)));
  }
  return products;
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<ProductDocument>>(
    getModelToken(Product.name),
  );

  console.log(`Requesting ${SEED_COUNT} products from gemma at ${GEMMA_URL}...`);
  const products = await generateProducts(SEED_COUNT);

  await productModel.deleteMany({});
  const inserted = await productModel.insertMany(products);
  console.log(`Seeded ${inserted.length} products.`);

  await app.close();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
