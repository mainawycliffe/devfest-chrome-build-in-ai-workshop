import { Injectable, signal } from '@angular/core';

export interface TextHistory {
  id?: number;
  text: string;
  platform: string;
  timestamp: number;
  characterCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'texttzar-db';
  private storeName = 'text-history';
  private db: IDBDatabase | null = null;
  
  readonly history = signal<TextHistory[]>([]);

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadHistory();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('platform', 'platform', { unique: false });
        }
      };
    });
  }

  async saveText(text: string, platform: string): Promise<void> {
    if (!this.db || !text.trim()) return;

    const entry: TextHistory = {
      text,
      platform,
      timestamp: Date.now(),
      characterCount: text.length
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(entry);

      request.onsuccess = () => {
        this.loadHistory();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async loadHistory(limit: number = 50): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const results: TextHistory[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          this.history.set(results);
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getHistoryByPlatform(platform: string): Promise<TextHistory[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('platform');
      const request = index.getAll(platform);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHistory(id: number): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.loadHistory();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllHistory(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        this.history.set([]);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Auto-save draft to localStorage for quick recovery
  saveDraft(text: string): void {
    localStorage.setItem('texttzar-draft', text);
  }

  loadDraft(): string {
    return localStorage.getItem('texttzar-draft') || '';
  }

  clearDraft(): void {
    localStorage.removeItem('texttzar-draft');
  }
}
