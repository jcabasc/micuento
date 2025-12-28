// Story types
export interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  pageCount: number;
  price: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryPage {
  id: string;
  storyId: string;
  pageNumber: number;
  imageTemplate: string;
  textTemplate: string;
}

// Order types
export interface Order {
  id: string;
  userEmail: string;
  storyId: string;
  childName: string;
  childAge: number;
  childPhotoUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  paymentStatus: "pending" | "approved" | "declined";
  wompiTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedBook {
  id: string;
  orderId: string;
  pdfUrl: string;
  previewImages: string[];
  createdAt: Date;
}

// Personalization types
export interface ChildPersonalization {
  name: string;
  age: number;
  photoFile?: File;
  photoUrl?: string;
}
