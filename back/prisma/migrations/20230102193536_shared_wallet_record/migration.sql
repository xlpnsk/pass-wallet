-- CreateTable
CREATE TABLE `SharedWalletRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `walletRecordId` INTEGER NOT NULL,
    `coOwnerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SharedWalletRecord` ADD CONSTRAINT `SharedWalletRecord_walletRecordId_fkey` FOREIGN KEY (`walletRecordId`) REFERENCES `WalletRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SharedWalletRecord` ADD CONSTRAINT `SharedWalletRecord_coOwnerId_fkey` FOREIGN KEY (`coOwnerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
