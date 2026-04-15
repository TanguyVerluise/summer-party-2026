import { Client } from "@notionhq/client";
import { Guest } from "@/types";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

function extractProperty(page: any, name: string): string {
  const prop = page.properties[name];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title?.[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text?.[0]?.plain_text ?? "";
    default:
      return "";
  }
}

function extractFileProperty(page: any, name: string): string | null {
  const prop = page.properties[name];
  if (!prop) return null;

  if (prop.type === "files" && prop.files.length > 0) {
    const file = prop.files[0];
    if (file.type === "file") return file.file.url;
    if (file.type === "external") return file.external.url;
  }

  if (prop.type === "url" && prop.url) {
    return prop.url;
  }

  return null;
}

export async function fetchGuests(): Promise<Guest[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Statut",
        select: { equals: "Confirmed" },
      },
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const guests: Guest[] = pages.map((page) => ({
    id: page.id,
    firstName: extractProperty(page, "Prénom"),
    lastName: extractProperty(page, "Nom de Famille"),
    jobTitle: extractProperty(page, "Poste"),
    company: extractProperty(page, "Entreprise"),
    photoUrl: extractFileProperty(page, "Photo"),
    logoUrl: extractFileProperty(page, "Logo"),
  }));

  // Tri alphabétique par entreprise (regroupe les invités d'une même boîte),
  // puis par prénom pour un ordre stable.
  return guests.sort((a, b) => {
    const byCompany = a.company.localeCompare(b.company, "fr", { sensitivity: "base" });
    if (byCompany !== 0) return byCompany;
    return a.firstName.localeCompare(b.firstName, "fr", { sensitivity: "base" });
  });
}
