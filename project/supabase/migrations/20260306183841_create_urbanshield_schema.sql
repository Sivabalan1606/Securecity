/*
  # UrbanShield Database Schema

  ## Overview
  This migration creates the complete database schema for the UrbanShield platform,
  a secure access and API protection system for urban infrastructure management.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - User role: admin, city_engineer, maintenance_staff, public_viewer
  - `department` (text) - Department/division
  - `is_active` (boolean) - Account status
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `infrastructure_assets`
  Urban infrastructure monitoring data
  - `id` (uuid, PK) - Asset identifier
  - `name` (text) - Asset name
  - `type` (text) - Asset type: bridge, road, streetlight, water_pipeline, hospital
  - `location` (jsonb) - Geographic coordinates {lat, lng}
  - `status` (text) - Current status: operational, maintenance_required, critical, offline
  - `health_score` (int) - Health indicator 0-100
  - `last_inspection` (timestamptz) - Last inspection date
  - `maintenance_due` (timestamptz) - Next maintenance date
  - `description` (text) - Asset description
  - `metadata` (jsonb) - Additional asset data
  - `created_at` (timestamptz) - Record creation
  - `updated_at` (timestamptz) - Last update

  ### 3. `activity_logs`
  System activity and audit trail
  - `id` (uuid, PK) - Log entry identifier
  - `user_id` (uuid, FK) - User who performed action
  - `action` (text) - Action performed
  - `resource` (text) - Resource accessed
  - `details` (jsonb) - Additional details
  - `ip_address` (text) - Client IP address
  - `status` (text) - success, failed, blocked
  - `timestamp` (timestamptz) - When action occurred

  ### 4. `security_alerts`
  Security monitoring and threat detection
  - `id` (uuid, PK) - Alert identifier
  - `alert_type` (text) - Type: brute_force, api_abuse, unauthorized_access, suspicious_activity
  - `severity` (text) - Severity: low, medium, high, critical
  - `user_id` (uuid, FK) - Associated user
  - `description` (text) - Alert description
  - `details` (jsonb) - Additional context
  - `ip_address` (text) - Source IP
  - `resolved` (boolean) - Resolution status
  - `resolved_at` (timestamptz) - Resolution timestamp
  - `resolved_by` (uuid, FK) - Admin who resolved
  - `created_at` (timestamptz) - Alert creation

  ### 5. `api_keys`
  API key management for external applications
  - `id` (uuid, PK) - Key identifier
  - `key` (text, unique) - API key value
  - `name` (text) - Key name/description
  - `created_by` (uuid, FK) - Admin who created key
  - `permissions` (jsonb) - Allowed operations
  - `rate_limit` (int) - Requests per minute
  - `is_active` (boolean) - Key status
  - `last_used` (timestamptz) - Last usage
  - `expires_at` (timestamptz) - Expiration date
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `maintenance_reports`
  Field inspection and maintenance reports
  - `id` (uuid, PK) - Report identifier
  - `asset_id` (uuid, FK) - Associated infrastructure asset
  - `submitted_by` (uuid, FK) - Staff member
  - `report_type` (text) - Type: inspection, maintenance, repair, emergency
  - `status` (text) - Status: pending, in_progress, completed
  - `priority` (text) - Priority: low, medium, high, urgent
  - `findings` (text) - Inspection findings
  - `actions_taken` (text) - Actions performed
  - `images` (jsonb) - Image URLs
  - `created_at` (timestamptz) - Report submission
  - `updated_at` (timestamptz) - Last update

  ## Security
  - All tables have RLS enabled
  - Policies restrict access based on user roles
  - Admin role has full access
  - City engineers can read infrastructure and alerts
  - Maintenance staff can update reports
  - Public viewers have limited read access

  ## Indexes
  - Optimized for common queries on user_id, timestamp, asset_id
  - Full-text search ready on asset names and descriptions
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'city_engineer', 'maintenance_staff', 'public_viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('bridge', 'road', 'streetlight', 'water_pipeline', 'hospital');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM ('operational', 'maintenance_required', 'critical', 'offline');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'public_viewer',
  department text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Infrastructure assets table
CREATE TABLE IF NOT EXISTS infrastructure_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location jsonb,
  status text DEFAULT 'operational',
  health_score int DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_inspection timestamptz,
  maintenance_due timestamptz,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  status text DEFAULT 'success',
  timestamp timestamptz DEFAULT now()
);

-- Security alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text DEFAULT 'medium',
  user_id uuid REFERENCES profiles(id),
  description text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  permissions jsonb DEFAULT '[]'::jsonb,
  rate_limit int DEFAULT 100,
  is_active boolean DEFAULT true,
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Maintenance reports table
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES infrastructure_assets(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES profiles(id),
  report_type text DEFAULT 'inspection',
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  findings text,
  actions_taken text,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_infrastructure_assets_type ON infrastructure_assets(type);
CREATE INDEX IF NOT EXISTS idx_infrastructure_assets_status ON infrastructure_assets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_reports_asset_id ON maintenance_reports(asset_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Infrastructure assets policies
CREATE POLICY "Authenticated users can view infrastructure"
  ON infrastructure_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Engineers and admins can update infrastructure"
  ON infrastructure_assets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'city_engineer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'city_engineer')
    )
  );

CREATE POLICY "Admins can insert infrastructure"
  ON infrastructure_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Security alerts policies
CREATE POLICY "Admins can view all security alerts"
  ON security_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert security alerts"
  ON security_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update security alerts"
  ON security_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- API keys policies
CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Maintenance reports policies
CREATE POLICY "Staff can view maintenance reports"
  ON maintenance_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'city_engineer', 'maintenance_staff')
    )
  );

CREATE POLICY "Maintenance staff can create reports"
  ON maintenance_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'maintenance_staff')
    )
  );

CREATE POLICY "Maintenance staff can update own reports"
  ON maintenance_reports FOR UPDATE
  TO authenticated
  USING (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'public_viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_infrastructure_assets_updated_at ON infrastructure_assets;
CREATE TRIGGER update_infrastructure_assets_updated_at
  BEFORE UPDATE ON infrastructure_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_reports_updated_at ON maintenance_reports;
CREATE TRIGGER update_maintenance_reports_updated_at
  BEFORE UPDATE ON maintenance_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();