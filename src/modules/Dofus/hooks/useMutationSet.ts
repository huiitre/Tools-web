import { clientV2 } from "@/services/axiosInstance";

export const useMutationCreateSet = async () => {
  return await clientV2.post(`/dofus/set/add`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationEditSet = async (
  id: any,
  columns: Record<string, { value: any; type: string }>
) => {
  const payload = {
    columns: Object.keys(columns).map((key) => ({
      column: key,
      value: columns[key].value,
      type: columns[key].type,
    })),
  };

  return await clientV2.put(`/dofus/set/${id}/update`, payload, {
    headers: {
      requireToken: true,
    },
  });
};

export const useMutationDeleteSet = async (id: any) => {
  return await clientV2.delete(`/dofus/set/${id}/delete`, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationAddItemsToSet = async (id: any, items: any) => {
  return await clientV2.post(`/dofus/set/${id}/item/add`, {
    list: items
  }, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationDeleteItemsToSet = async (id: any, items: any) => {
  return await clientV2.post(`/dofus/set/${id}/item/delete`, {
    list: items
  }, {
    headers: {
      requireToken: true
    }
  });
};

export const useMutationMultiplier = async (idset: any, iditem: number, multiplier: number) => {
  return await clientV2.put(`/dofus/set/${idset}/${iditem}/multiplier/${multiplier}`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationQuantityAlreadyObtained = async (idset: any, idrecipe_item_has_set: number, quantity: number) => {
  return await clientV2.put(`/dofus/set/${idset}/recipe/${idrecipe_item_has_set}/${quantity}`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationCreateShareToken = async(idset: number) => {
  return await clientV2.post(`/dofus/set/${idset}/share`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const createImportedSet = async (importPayload: any) => {
  try {
    return await clientV2.post(
      "/dofus/set/import/create",
      importPayload,
      {
        headers: { requireToken: true }
      }
    );
  } catch (err) {
    console.error("Erreur API createImportedSet :", err);
    throw err;
  }
};