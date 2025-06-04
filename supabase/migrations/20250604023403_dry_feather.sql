/*
  # Initial Schema Setup for Repair Management System

  1. New Tables
    - branches
      - Main branch and sub-branches
      - Contact and location info
      - Branch type (HQ/branch)
    
    - products
      - Global product catalog
      - Device types, brands, models
      - Base pricing info
    
    - branch_products
      - Branch-specific product inventory
      - Custom pricing per branch
      - Stock tracking
    
    - orders
      - Customer orders and repairs
      - Order status tracking
      - Warranty info
      - Branch assignment
    
    - warranties
      - 6-month warranty tracking
      - Part-specific coverage
      - Warranty terms

  2. Security
    - Enable RLS on all tables
    - Branch-specific access policies
    - Role-based permissions
*/

-- Create enum types
CREATE TYPE branch_type AS ENUM ('headquarters', 'branch');
CREATE TYPE device_type AS ENUM ('computer', 'tablet', 'ipad', 'phone', 'other');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'completed', 'cancelled', 'closed');
CREATE TYPE warranty_status AS ENUM ('active', 'expired', 'claimed');

-- Branches table
CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type branch_type NOT NULL DEFAULT 'branch',
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table (global catalog)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type device_type NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  name text NOT NULL,
  description text,
  base_purchase_price decimal(10,2) NOT NULL,
  base_selling_price decimal(10,2) NOT NULL,
  warranty_eligible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Branch-specific products
CREATE TABLE branch_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id),
  product_id uuid REFERENCES products(id),
  purchase_price decimal(10,2) NOT NULL,
  selling_price decimal(10,2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(branch_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  branch_id uuid REFERENCES branches(id),
  customer_id uuid REFERENCES auth.users(id),
  status order_status DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  amount_paid decimal(10,2) DEFAULT 0,
  device_info jsonb NOT NULL,
  notes text,
  barcode text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES auth.users(id),
  cancellation_reason text
);

-- Order items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  warranty_issued boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Warranties
CREATE TABLE warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES order_items(id),
  warranty_number text UNIQUE NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status warranty_status DEFAULT 'active',
  terms jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

-- Branch access policies
CREATE POLICY "HQ can access all branches"
  ON branches
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'branch_type' = 'headquarters'
  );

CREATE POLICY "Staff can access own branch"
  ON branches
  FOR SELECT
  TO authenticated
  USING (
    id = (auth.jwt() ->> 'branch_id')::uuid
  );

-- Product catalog policies
CREATE POLICY "HQ can manage global catalog"
  ON products
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'branch_type' = 'headquarters'
  );

CREATE POLICY "Branches can view catalog"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Branch products policies
CREATE POLICY "Branches can manage own inventory"
  ON branch_products
  FOR ALL
  TO authenticated
  USING (
    branch_id = (auth.jwt() ->> 'branch_id')::uuid
  );

CREATE POLICY "HQ can view all inventory"
  ON branch_products
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'branch_type' = 'headquarters'
  );

-- Order policies
CREATE POLICY "Branches can manage own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    branch_id = (auth.jwt() ->> 'branch_id')::uuid
  );

CREATE POLICY "HQ can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'branch_type' = 'headquarters'
  );

-- Create indexes
CREATE INDEX idx_products_device_type ON products(device_type);
CREATE INDEX idx_products_brand_model ON products(brand, model);
CREATE INDEX idx_branch_products_stock ON branch_products(stock_quantity) WHERE stock_quantity <= 10;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_branch_date ON orders(branch_id, created_at);
CREATE INDEX idx_warranties_status ON warranties(status);