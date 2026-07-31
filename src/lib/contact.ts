import { db } from "@/lib/db";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export async function createContactMessage(input: CreateContactMessageInput) {
  return db.contactMessage.create({ data: input });
}

export async function getContactMessages() {
  return db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markContactMessageRead(id: string) {
  return db.contactMessage.update({ where: { id }, data: { status: "READ" } });
}

export async function deleteContactMessage(id: string) {
  return db.contactMessage.delete({ where: { id } });
}
