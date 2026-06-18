// IndexedDB utility for MCP Drive local client persistence.
// Allows completely secure local storage of server nodes, host credentials, DNS domains, and file trees.

export interface WorkspacePayload {
  linuxFiles: any[];
  windowsFiles: any[];
  domains: any[];
  resources: any[];
  mcpServers: any[];
  chatMessages: any[];
  llmConfig: any;
  credentials: Record<string, string | null>;
}

const DB_NAME = "mcp_drive_db";
const DB_VERSION = 1;
const WORKSPACE_STORE = "workspace";
const SNAPSHOT_STORE = "snapshots";

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB load error:", event);
      reject(new Error("IndexedDB를 열 수 없습니다."));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if not existing
      if (!db.objectStoreNames.contains(WORKSPACE_STORE)) {
        db.createObjectStore(WORKSPACE_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE, { keyPath: "id" });
      }
    };
  });
}

// Save active workspace state
export async function saveWorkspaceLocal(payload: WorkspacePayload): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([WORKSPACE_STORE], "readwrite");
      const store = transaction.objectStore(WORKSPACE_STORE);
      const request = store.put({ id: "active", payload });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to save workspace in IndexedDB:", err);
  }
}

// Load active workspace state
export async function loadWorkspaceLocal(): Promise<WorkspacePayload | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([WORKSPACE_STORE], "readonly");
      const store = transaction.objectStore(WORKSPACE_STORE);
      const request = store.get("active");

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.payload as WorkspacePayload);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load workspace from IndexedDB:", err);
    return null;
  }
}

// Save all snapshots array
export async function saveSnapshotsLocal(snapshots: any[]): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SNAPSHOT_STORE], "readwrite");
      const store = transaction.objectStore(SNAPSHOT_STORE);
      const request = store.put({ id: "list", data: snapshots });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to save snapshots in IndexedDB:", err);
  }
}

// Load all snapshots array
export async function loadSnapshotsLocal(): Promise<any[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SNAPSHOT_STORE], "readonly");
      const store = transaction.objectStore(SNAPSHOT_STORE);
      const request = store.get("list");

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data || []);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load snapshots from IndexedDB:", err);
    return [];
  }
}
