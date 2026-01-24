// API utilities
export { getAdminToken, setAdminToken, clearAdminToken, fetchAdminApi } from "./api";

// Auth
export { adminLogin, verifyAdminToken } from "./auth";

// Documents
export { getSignedUploadUrl, uploadImageToGCS } from "./documents";

// Orders
export { fetchAdminOrders, updateOrderStatus, updateOrderLabel } from "./orders";

// Products
export {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  cloneProduct,
  createOrUpdateTranslation,
  deleteTranslation,
  createVariation,
  updateVariation,
  deleteVariation,
  createOrUpdateVariationTranslation,
  deleteVariationTranslation,
  reorderProducts,
  reorderVariations,
} from "./products";

// Tags
export {
  fetchAdminTags,
  createTag,
  getTag,
  updateTag,
  deleteTag,
  createOrUpdateTagTranslation,
  deleteTagTranslation,
  reorderTags,
  getProductTags,
  updateProductTags,
} from "./tags";

// Tips
export {
  fetchAdminTips,
  createTip,
  getTip,
  updateTip,
  deleteTip,
  createOrUpdateTipTranslation,
  deleteTipTranslation,
  reorderTips,
} from "./tips";
