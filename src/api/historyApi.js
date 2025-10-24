import axios from "axios";

const API_BASE_URL = "/api/history";

const DOMAIN_PATH = {
  client: "client",
  order: "order",
  sales: "sales",
  collection: "collection",
  salesTarget: "salesTarget",
};

/**
 * @param {'client'|'order'|'sales'|'collection'|'salesTarget'} domain
 * @param {string|number} id
 */
export const getHistory = (domain, id) => {
  const path = DOMAIN_PATH[domain];
  if (!path) throw new Error(`Unknown domain: ${domain}`);
  return axios.get(`${API_BASE_URL}/${path}/${id}`);
};
