import client from "@/services/axiosInstance";

export const useMutationCreateSet = async () => {
  return await client.post(`/dofus/set/add`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationEditSet = async (id: any, columns: Record<string, { value: any; type: string }>) => {
  const payload = {
    columns: Object.keys(columns).reduce((acc, key) => {
      acc[key] = {
          value: columns[key].value,
          type: columns[key].type,
      };
      return acc;
    }, {} as Record<string, { value: any; type: string }>),
  };

  return await client.patch(`/dofus/set/${id}/update`, payload, {
    headers: {
      requireToken: true,
    },
  });
};

export const useMutationDeleteSet = async (id: any) => {
  return await client.delete(`/dofus/set/${id}/delete`, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationAddItemsToSet = async (id: any, items: any) => {
  return await client.post(`/dofus/set/${id}/item/add`, {
    list: items
  }, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationDeleteItemsToSet = async (id: any, items: any) => {
  return await client.delete(`/dofus/set/${id}/item/delete`, {
    data: {
      list: items
    },
    headers: {
      requireToken: true
    }
  });
};

export const useMutationMultiplier = async (idset: any, iditem: number, multiplier: number) => {
  return await client.patch(`/dofus/set/${idset}/${iditem}/multiplier/${multiplier}`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationQuantityAlreadyObtained = async (idset: any, idrecipe_item_has_set: number, quantity: number) => {
  return await client.patch(`/dofus/set/${idset}/recipe/${idrecipe_item_has_set}/${quantity}`, {}, {
    headers: {
      requireToken: true
    }
  })
}

export const useMutationCreateShareLink = async(idset: number) => {
  return await client.post(`/dofus/set/${idset}/share`, {}, {
    headers: {
      requireToken: true
    }
  })
}