-- BDS PRO Database Schema for Railway (MySQL)
-- This schema is optimized for Railway's MySQL database

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255),
  `account_balance` DECIMAL(15,2) DEFAULT 0.00,
  `total_earning` DECIMAL(15,2) DEFAULT 0.00,
  `rewards` DECIMAL(15,2) DEFAULT 0.00,
  `referral_code` VARCHAR(20) UNIQUE,
  `referred_by` VARCHAR(20),
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `level` ENUM('Starter', 'Professional', 'Premium') DEFAULT 'Starter',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_referral_code` (`referral_code`),
  INDEX `idx_referred_by` (`referred_by`)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'growth', 'referral', 'bonus') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` TEXT,
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  `related_user_id` VARCHAR(255),
  `reference_id` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` VARCHAR(255) NOT NULL,
  `referred_id` VARCHAR(255) NOT NULL,
  `level` TINYINT NOT NULL DEFAULT 1,
  `commission_rate` DECIMAL(5,2) DEFAULT 1.00,
  `total_commission` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_referral` (`referrer_id`, `referred_id`),
  INDEX `idx_referrer` (`referrer_id`),
  INDEX `idx_referred` (`referred_id`)
);

-- Investment plans table
CREATE TABLE IF NOT EXISTS `investment_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `min_amount` DECIMAL(15,2) NOT NULL,
  `max_amount` DECIMAL(15,2),
  `growth_rate` DECIMAL(5,2) NOT NULL,
  `referral_rate` DECIMAL(5,2) NOT NULL,
  `duration_days` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User investments table
CREATE TABLE IF NOT EXISTS `user_investments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `plan_id` INT NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `start_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `end_date` TIMESTAMP NOT NULL,
  `status` ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  `total_growth` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `investment_plans`(`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
);

-- System settings table
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` TEXT,
  `description` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default investment plans
INSERT INTO `investment_plans` (`name`, `min_amount`, `max_amount`, `growth_rate`, `referral_rate`, `duration_days`) VALUES
('Starter', 50.00, 499.99, 6.00, 1.00, 30),
('Professional', 500.00, 4999.99, 6.00, 1.00, 30),
('Premium', 5000.00, NULL, 6.00, 1.00, 30);

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('min_deposit', '50.00', 'Minimum deposit amount in USDT'),
('min_withdrawal', '10.00', 'Minimum withdrawal amount in USDT'),
('admin_fee_rate', '2.00', 'Admin fee percentage for withdrawals'),
('growth_rate', '6.00', 'Monthly growth rate percentage'),
('referral_rate_level1', '1.00', 'Level 1 referral commission rate'),
('referral_rate_level2', '0.50', 'Level 2 referral commission rate'),
('withdrawal_processing_hours', '24', 'Withdrawal processing time in hours'),
('maintenance_mode', 'false', 'System maintenance mode');

-- Create views for easier querying
CREATE VIEW `user_summary` AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.account_balance,
  u.total_earning,
  u.rewards,
  u.referral_code,
  u.level,
  u.status,
  u.created_at,
  COUNT(DISTINCT r1.id) as level1_referrals,
  COUNT(DISTINCT r2.id) as level2_referrals,
  COALESCE(SUM(t.amount), 0) as total_deposits
FROM users u
LEFT JOIN referrals r1 ON u.id = r1.referrer_id AND r1.level = 1
LEFT JOIN referrals r2 ON u.id = r2.referrer_id AND r2.level = 2
LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'deposit' AND t.status = 'completed'
GROUP BY u.id;

-- Create view for transaction summary
CREATE VIEW `transaction_summary` AS
SELECT 
  t.id,
  t.user_id,
  u.name as user_name,
  u.email as user_email,
  t.type,
  t.amount,
  t.description,
  t.status,
  t.created_at,
  t.processed_at
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;
