import { getDriveAccessToken } from './googleDriveAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export interface DriveFolderStructure {
  yearFolderId?: string;
  stateFolderId?: string;
  caseFolderId?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

export const listGoogleDriveFiles = async (
  query: string = "trashed = false",
  pageSize: number = 25
): Promise<{ files: DriveFileItem[] }> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive no está conectado. Por favor inicia sesión con Google.');
  }

  const params = new URLSearchParams({
    q: query,
    pageSize: pageSize.toString(),
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink)',
    orderBy: 'modifiedTime desc',
  });

  const res = await fetch(`${DRIVE_API_URL}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error ${res.status} al consultar Google Drive`);
  }

  return await res.json();
};

export const findOrCreateDriveFolder = async (
  folderName: string,
  parentId?: string
): Promise<string> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Token no disponible');

  let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const searchRes = await listGoogleDriveFiles(q, 5);
  if (searchRes.files && searchRes.files.length > 0) {
    return searchRes.files[0].id;
  }

  // Create folder
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al crear carpeta en Google Drive');
  }

  const folder = await createRes.json();
  return folder.id;
};

// Create the complete HIGHUB / AUDIT-TAX directory on user's Google Drive: /HIGHUB/{AÑO}/{ESTADO}/{CASO}/
export const createTaxCaseDriveVault = async (
  year: string,
  state: string,
  caseId: string,
  clientName: string
): Promise<DriveFolderStructure & { folderLink?: string }> => {
  const rootId = await findOrCreateDriveFolder('AUDIT_INTELLIGENCE_HIGHUB');
  const yearId = await findOrCreateDriveFolder(year, rootId);
  const stateId = await findOrCreateDriveFolder(state.toUpperCase(), yearId);
  const clientDir = `${caseId}_${clientName.replace(/\s+/g, '_').toUpperCase()}`;
  const caseIdFolder = await findOrCreateDriveFolder(clientDir, stateId);

  return {
    yearFolderId: yearId,
    stateFolderId: stateId,
    caseFolderId: caseIdFolder,
    folderLink: `https://drive.google.com/drive/folders/${caseIdFolder}`,
  };
};

// Upload tax evidence / documents / 1040 forms to Google Drive
export const uploadFileToDrive = async (
  fileContent: Blob | string,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<DriveFileItem> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Token no disponible');

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );

  const fileBlob = typeof fileContent === 'string'
    ? new Blob([fileContent], { type: mimeType })
    : fileContent;

  form.append('file', fileBlob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al subir archivo a Google Drive');
  }

  return await res.json();
};

// Delete file with confirmation safety check
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Token no disponible');

  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.ok;
};
