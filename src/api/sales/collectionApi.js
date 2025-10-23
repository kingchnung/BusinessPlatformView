import axiosInstance from "../../common/axiosInstance";

export const listCollections = async (params) => {
  const { data } = await axiosInstance.get("/sales/collection/list", {
    params: params,
  });
  return data; // PageResponseDTO<CollectionDTO>
};

export const getCollection = async (collectionId) => {
  const { data } = await axiosInstance.get(`/sales/collection/${collectionId}`);
  return data; // CollectionDTO
};

export const registerCollection = async (payload) => {
  const { data } = await axiosInstance.post("/sales/collection/", payload);
  return data; // { CollectionId: "YYYYMMDD-####" }
};

export const modifyCollection = async (collectionId, payload) => {
  const { data } = await axiosInstance.put(`/sales/collection/${collectionId}`, payload);
  return data; // { RESULT: "SUCCESS" }
};

export const removeCollection = async (collectionId) => {
  const { data } = await axiosInstance.delete(`/sales/collection/${collectionId}`);
  return data; // { RESULT: "SUCCESS" }
};


export const listCollectionsByClient = async (clientId) => {
  const { data } = await axiosInstance.get(`/sales/collection/client/${clientId}`);
  return data; // List<CollectionDTO>
};