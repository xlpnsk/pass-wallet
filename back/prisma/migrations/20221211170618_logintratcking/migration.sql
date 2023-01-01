-- CreateTable
CREATE TABLE `LoginRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loginTime` DATETIME(3) NOT NULL,
    `wasLoginSuccessful` BOOLEAN NOT NULL,
    `attempt` INTEGER NOT NULL,
    `ipId` INTEGER NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IPRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipAddress` VARCHAR(191) NOT NULL,
    `blockedUntil` DATETIME(3) NULL,
    `isBlockedPermanently` BOOLEAN NULL,

    UNIQUE INDEX `IPRecord_ipAddress_key`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LoginRecord` ADD CONSTRAINT `LoginRecord_ipId_fkey` FOREIGN KEY (`ipId`) REFERENCES `IPRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoginRecord` ADD CONSTRAINT `LoginRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
