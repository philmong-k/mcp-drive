// Google Drive Sync API interaction helpers (client-side only, no server API key dependencies)

const BACKUP_FILENAME = "mcp-drive-backup.json";

export interface DriveBackupPayload {
  workspace: any;
  snapshots: any[];
  syncedAt: string;
}

/**
 * Find backing file id in user's Google Drive.
 */
export async function findDriveBackupFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!resp.ok) {
      throw new Error(`Drive Query Failed: ${resp.statusText}`);
    }

    const data = await resp.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (err) {
    console.error("Failed to find Google Drive backup file:", err);
    throw err;
  }
}

/**
 * Download backup file content from user's Google Drive.
 */
export async function downloadDriveBackupFile(accessToken: string, fileId: string): Promise<DriveBackupPayload | null> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!resp.ok) {
      throw new Error(`Drive Download Failed: ${resp.statusText}`);
    }

    const payload = await resp.json();
    return payload as DriveBackupPayload;
  } catch (err) {
    console.error("Failed to download Google Drive backup database:", err);
    throw err;
  }
}

/**
 * Create or overwrite current backup dataset to user's Google Drive.
 */
export async function uploadDriveBackupFile(
  accessToken: string,
  payload: DriveBackupPayload,
  existingFileId?: string | null
): Promise<string> {
  try {
    if (existingFileId) {
      // Overwrite an existing file. Use PATCH method for media content updates.
      const url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
      const resp = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Drive Overwrite Failed: ${resp.statusText}`);
      }

      return existingFileId;
    } else {
      // Setup multipart request to upload brand-new file with metadata name and media payload content.
      const metadata = {
        name: BACKUP_FILENAME,
        mimeType: "application/json",
        description: "MCP Drive Workspace & Snapshots Synchronized Cloud Backup"
      };

      const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const boundary = "mcp_drive_sync_multipart_boundary";
      
      const body = [
        `--${boundary}`,
        "Content-Type: application/json; charset=UTF-8",
        "",
        JSON.stringify(metadata),
        `--${boundary}`,
        "Content-Type: application/json",
        "",
        JSON.stringify(payload),
        `--${boundary}--`
      ].join("\r\n");

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body
      });

      if (!resp.ok) {
        throw new Error(`Drive Create Failed: ${resp.statusText}`);
      }

      const fileData = await resp.json();
      return fileData.id;
    }
  } catch (err) {
    console.error("Failed to upload Google Drive backup database:", err);
    throw err;
  }
}
