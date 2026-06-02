export const STORAGE_BUCKETS = {
  rawDocuments: "raw-documents",
  contestNotices: "contest-notices",
} as const;

export type StorageBucketName = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
