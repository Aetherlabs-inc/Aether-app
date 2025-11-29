-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  certificate_id VARCHAR(255) UNIQUE NOT NULL,
  qr_code_url TEXT,
  blockchain_hash TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view certificates for their own artworks
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = certificates.artwork_id
      AND artworks.user_id = auth.uid()
    )
  );

-- Create policy: Users can insert certificates for their own artworks
CREATE POLICY "Users can insert own certificates" ON certificates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = certificates.artwork_id
      AND artworks.user_id = auth.uid()
    )
  );

-- Create policy: Users can update certificates for their own artworks
CREATE POLICY "Users can update own certificates" ON certificates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = certificates.artwork_id
      AND artworks.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_artwork_id ON certificates(artwork_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);

