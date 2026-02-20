-- Add profile_image, specialty, and is_featured columns to users table for doctors
-- Run this script in SQL Server Management Studio or via sqlcmd

-- Add specialty column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'specialty')
BEGIN
    ALTER TABLE users ADD specialty NVARCHAR(100) NULL;
    PRINT 'Added specialty column';
END
ELSE
BEGIN
    PRINT 'specialty column already exists';
END

-- Add profile_image column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'profile_image')
BEGIN
    ALTER TABLE users ADD profile_image NVARCHAR(255) NULL;
    PRINT 'Added profile_image column';
END
ELSE
BEGIN
    PRINT 'profile_image column already exists';
END

-- Add is_featured column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'is_featured')
BEGIN
    ALTER TABLE users ADD is_featured BIT DEFAULT 0;
    PRINT 'Added is_featured column';
END
ELSE
BEGIN
    PRINT 'is_featured column already exists';
END

-- Update existing doctors to be featured by default
UPDATE users SET is_featured = 1 WHERE role = 'doctor';

PRINT 'Migration completed successfully!';
