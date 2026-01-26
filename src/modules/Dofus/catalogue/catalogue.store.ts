// catalogue.store.ts

import { defineStore } from 'pinia';
import {
  CatalogueState,
  CatalogueColumn,
  CatalogueItem,
  CataloguePageSize,
  CatalogueSortDir,
} from '@/modules/Dofus/catalogue/types/catalogue.types';
import { useFetchSearch } from '@/modules/Dofus/catalogue/fetch/catalogue.fetch';
import { useUIStore } from '@/stores/ui.store';

const STORAGE_KEY_COLUMNS = 'dofus.catalogue.columns';
const STORAGE_KEY_PAGE_SIZE = 'dofus.catalogue.page_size';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = CataloguePageSize.M;
const DEFAULT_SORT: string | null = null;
const DEFAULT_DIR: CatalogueSortDir = 'ASC';

/** poids par défaut selon le type de donnée */
const DEFAULT_GROW_BY_KEY: Record<string, number> = {
  id: 0,
  asset_id: 0,
  type: 0,
  name: 2,
  description: 3,

  user_price: 1,
  community_average_price: 1,
  last_updated_price: 1,

  craft_user_price: 1,
  craft_community_price: 1,
  craft_last_price: 1,
  craft_calculated_price: 2,
};

export const useCatalogueStore = defineStore('dofus.catalogue', {
  state: (): CatalogueState => {

    const storedPageSize = localStorage.getItem(STORAGE_KEY_PAGE_SIZE)

    return {
      items: [],
      ingredients: [],
      total: 0,

      q: null,

      page: DEFAULT_PAGE,
      pageSize: storedPageSize 
        ? (parseInt(storedPageSize, 10) as CataloguePageSize) 
        : DEFAULT_PAGE_SIZE,
      previousPage: null,
      nextPage: null,
      lastPage: null,

      sort: DEFAULT_SORT,
      dir: DEFAULT_DIR,

      columns: [],
      visibleColumns: new Set<string>(),

      error: null,
    }
  },

  getters: {
    visibleCatalogueColumns(state): CatalogueColumn[] {
      return state.columns.filter((c) => state.visibleColumns.has(c.key));
    },

    hasPreviousPage: (s) => s.previousPage !== null,
    hasNextPage: (s) => s.nextPage !== null,
  },

  actions: {
    async search() {

      const uiStore = useUIStore();

      this.error = null;

      try {
        uiStore.setLoading(true);
        const { data } = await useFetchSearch({
          q: this.q,
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sort,
          dir: this.dir,
        });

        this.hydrateColumns(data.columns);
        this.setItems(
          data.items,
          data.total,
          data.page,
          data.pageSize,
          data.previousPage,
          data.nextPage,
          data.lastPage,
        );
      } catch (e: any) {
        this.error = e?.message ?? 'Erreur catalogue';
      } finally {
        uiStore.setLoading(false);
      }
    },

    hydrateColumns(apiColumns: CatalogueColumn[]) {
      const storedRaw = localStorage.getItem(STORAGE_KEY_COLUMNS);
      const stored: CatalogueColumn[] = storedRaw ? JSON.parse(storedRaw) : [];

      const storedByKey = new Map(stored.map((c) => [c.key, c]));

      const merged: CatalogueColumn[] = apiColumns.map((apiCol) => {
        const prev = storedByKey.get(apiCol.key);

        return {
          ...apiCol,
          visible: prev?.visible ?? apiCol.visible,
          grow: prev?.grow ?? DEFAULT_GROW_BY_KEY[apiCol.key] ?? 1,
        };
      });

      this.columns = merged;
      this.visibleColumns = new Set(
        merged.filter((c) => c.visible).map((c) => c.key),
      );

      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(merged));

      const storedPageSize = localStorage.getItem(STORAGE_KEY_PAGE_SIZE);
      if (storedPageSize) {
        this.pageSize = parseInt(storedPageSize, 10) as CataloguePageSize;
      }
    },

    toggleColumn(key: string) {
      const col = this.columns.find((c) => c.key === key);
      if (!col || !col.userToggle) return;

      col.visible = !col.visible;

      col.visible
        ? this.visibleColumns.add(key)
        : this.visibleColumns.delete(key);

      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(this.columns));
    },

    setQuery(q: string | null) {
      this.q = q;
      this.page = DEFAULT_PAGE;
    },

    setPage(page: number) {
      this.page = page;
    },

    setPageSize(size: CataloguePageSize) {
      this.pageSize = size;
      this.page = DEFAULT_PAGE;
      localStorage.setItem(STORAGE_KEY_PAGE_SIZE, String(size))
    },

    setSort(sort: string | null, dir: CatalogueSortDir) {
      this.sort = sort;
      this.dir = dir;
      this.page = DEFAULT_PAGE;
    },

    setItems(
      items: CatalogueItem[],
      total: number,
      page: number,
      pageSize: number,
      previousPage: number | null,
      nextPage: number | null,
      lastPage: number | null,
    ) {
      this.items = items;
      this.total = total;
      this.page = page;
      this.pageSize = pageSize;
      this.previousPage = previousPage;
      this.nextPage = nextPage;
      this.lastPage = lastPage;
    },

    clear() {
      this.columns = [];
      this.visibleColumns.clear();
      localStorage.removeItem(STORAGE_KEY_COLUMNS);
      localStorage.removeItem(STORAGE_KEY_PAGE_SIZE);
    },
  },
});
