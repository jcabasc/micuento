// Re-export Prisma types
export type {
  Story,
  StoryPage,
  Order,
  GeneratedBook,
  StoryStatus,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

// Custom types for forms and API
export interface ChildPersonalization {
  name: string;
  age: number;
  photoFile?: File;
  photoUrl?: string;
}

export interface CreateOrderInput {
  userEmail: string;
  storyId: string;
  childName: string;
  childAge: number;
  childPhotoUrl: string;
}
