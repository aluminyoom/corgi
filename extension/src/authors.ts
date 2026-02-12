export interface AuthorProfile {
  github: string;
  discord?: string;
}

export const AUTHORS: Record<string, AuthorProfile> = {
  aluminyoom: { github: 'https://github.com/aluminyoom' },
};

export function resolveAuthors(ids: string[]): { id: string; profile?: AuthorProfile }[] {
  return ids.map((id) => ({ id, profile: AUTHORS[id] }));
}

export function formatAuthors(ids: string[]): string {
  return ids.join(', ');
}
