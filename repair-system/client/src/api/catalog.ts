import api from './api';

// Description: Get all brands
// Endpoint: GET /api/catalog/brands
// Request: {}
// Response: { brands: BrandType[] }
export const getBrands = () => {
  // Mocking the response
  return new Promise<{ brands: BrandType[] }>((resolve) => {
    setTimeout(() => {
      resolve({ brands: mockBrands });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/catalog/brands');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get models by brand
// Endpoint: GET /api/catalog/brands/{brandId}/models
// Request: { brandId: string }
// Response: { models: ModelType[] }
export const getModelsByBrand = (brandId: string) => {
  // Mocking the response
  return new Promise<{ models: ModelType[] }>((resolve) => {
    setTimeout(() => {
      const models = mockModels.filter(model => model.brandId === brandId);
      resolve({ models });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/catalog/brands/${brandId}/models`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get parts by model
// Endpoint: GET /api/catalog/models/{modelId}/parts
// Request: { modelId: string }
// Response: { parts: PartType[] }
export const getPartsByModel = (modelId: string) => {
  // Mocking the response
  return new Promise<{ parts: PartType[] }>((resolve) => {
    setTimeout(() => {
      const parts = mockParts.filter(part => part.modelIds.includes(modelId));
      resolve({ parts });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/catalog/models/${modelId}/parts`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type BrandType = {
  _id: string;
  name: string;
  imageUrl?: string;
  active: boolean;
};

export type ModelType = {
  _id: string;
  name: string;
  brandId: string;
  imageUrl?: string;
  active: boolean;
};

export type PartType = {
  _id: string;
  name: string;
  modelIds: string[];
  price: number;
  stock: number;
  active: boolean;
};

// Mock data
const mockBrands: BrandType[] = [
  { _id: 'brand_1', name: 'Apple', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'brand_2', name: 'Samsung', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'brand_3', name: 'Google', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'brand_4', name: 'Dell', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'brand_5', name: 'HP', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'brand_6', name: 'Lenovo', active: true, imageUrl: 'https://placehold.co/100' }
];

const mockModels: ModelType[] = [
  { _id: 'model_1', name: 'iPhone 12', brandId: 'brand_1', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_2', name: 'iPhone 13', brandId: 'brand_1', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_3', name: 'iPhone 14', brandId: 'brand_1', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_4', name: 'Galaxy S21', brandId: 'brand_2', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_5', name: 'Galaxy S22', brandId: 'brand_2', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_6', name: 'Pixel 6', brandId: 'brand_3', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_7', name: 'Pixel 7', brandId: 'brand_3', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_8', name: 'XPS 15', brandId: 'brand_4', active: true, imageUrl: 'https://placehold.co/100' },
  { _id: 'model_9', name: 'Inspiron 15', brandId: 'brand_4', active: true, imageUrl: 'https://placehold.co/100' }
];

const mockParts: PartType[] = [
  { _id: 'part_1', name: 'Screen Replacement', modelIds: ['model_1', 'model_2'], price: 150, stock: 25, active: true },
  { _id: 'part_2', name: 'Battery', modelIds: ['model_1', 'model_2', 'model_3'], price: 80, stock: 50, active: true },
  { _id: 'part_3', name: 'Camera Module', modelIds: ['model_1', 'model_4', 'model_5'], price: 120, stock: 15, active: true },
  { _id: 'part_4', name: 'Charging Port', modelIds: ['model_1', 'model_2', 'model_3', 'model_4', 'model_5'], price: 60, stock: 30, active: true },
  { _id: 'part_5', name: 'Speaker', modelIds: ['model_1', 'model_2', 'model_3', 'model_4', 'model_5', 'model_6', 'model_7'], price: 40, stock: 45, active: true },
  { _id: 'part_6', name: 'Microphone', modelIds: ['model_1', 'model_2', 'model_3', 'model_4', 'model_5', 'model_6', 'model_7'], price: 35, stock: 40, active: true },
  { _id: 'part_7', name: 'Keyboard Replacement', modelIds: ['model_8', 'model_9'], price: 90, stock: 20, active: true },
  { _id: 'part_8', name: 'SSD 512GB', modelIds: ['model_8', 'model_9'], price: 150, stock: 15, active: true },
  { _id: 'part_9', name: 'RAM 16GB', modelIds: ['model_8', 'model_9'], price: 120, stock: 25, active: true },
  { _id: 'part_10', name: 'Cooling Fan', modelIds: ['model_8', 'model_9'], price: 70, stock: 30, active: true }
];