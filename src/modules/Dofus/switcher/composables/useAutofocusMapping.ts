import { ref } from 'vue';
import { indexedDBService } from '@/services/IndexedDBService';

export interface AutofocusMapping {
    id: string; // ID Hex (ex: e082d4ba0d)
    name: string; // Nom du personnage
}

const mapping = ref<Record<string, string>>({});

export function useAutofocusMapping() {
    async function loadMapping() {
        const store = await indexedDBService.getStore('autofocus_mapping', 'readonly');
        return new Promise<void>((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result as AutofocusMapping[];
                const map: Record<string, string> = {};
                results.forEach(item => {
                    map[item.id] = item.name;
                });
                mapping.value = map;
                // Sync with electron
                window.electron?.setAutofocusMapping(map);
                resolve();
            };
        });
    }

    async function saveEntry(id: string, name: string) {
        const store = await indexedDBService.getStore('autofocus_mapping', 'readwrite');
        return new Promise<void>((resolve, reject) => {
            const request = store.put({ id, name });
            request.onsuccess = () => {
                mapping.value[id] = name;
                window.electron?.setAutofocusMapping(mapping.value);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async function deleteEntry(id: string) {
        const store = await indexedDBService.getStore('autofocus_mapping', 'readwrite');
        return new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => {
                delete mapping.value[id];
                window.electron?.setAutofocusMapping(mapping.value);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async function clearMapping() {
        const store = await indexedDBService.getStore('autofocus_mapping', 'readwrite');
        return new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => {
                mapping.value = {};
                window.electron?.setAutofocusMapping({});
                window.switcher?.setAutofocusMapping?.({}); // Cas où on est dans le switcher
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Listener pour les mises à jour automatiques depuis le sniffer
    const api = window.electron || window.switcher;
    if (api && 'onAutofocusMappingUpdated' in api) {
        (api as any).onAutofocusMappingUpdated(async (newMapping: Record<string, string>) => {
            for (const [id, name] of Object.entries(newMapping)) {
                if (mapping.value[id] !== name) {
                    await saveEntry(id, name);
                }
            }
        });
    }

    return {
        mapping,
        loadMapping,
        saveEntry,
        deleteEntry,
        clearMapping
    };
}
