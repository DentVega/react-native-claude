const REPO_OWNER = 'DentVega';
const REPO_NAME = 'react-native-claude';

const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}`;
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export async function fetchLatestTag(): Promise<string> {
  const res = await fetch(`${API_BASE}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (res.status === 404) {
    return 'main';
  }
  if (!res.ok) {
    throw new Error(`GitHub API respondió ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { tag_name?: string };
  if (!data.tag_name) {
    throw new Error('La respuesta de GitHub no incluye tag_name.');
  }
  return data.tag_name;
}

export async function downloadRawFile(path: string, ref: string): Promise<string> {
  const url = `${RAW_BASE}/${ref}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo descargar ${path}@${ref} (${res.status})`);
  }
  return await res.text();
}
