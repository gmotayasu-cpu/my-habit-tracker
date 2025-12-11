import type { WorkTag } from '../types/workLogTypes';

/**
 * Default work tags for new users
 * IDs are stable and must never change once created
 */
export const DEFAULT_WORK_TAGS: WorkTag[] = [
  { id: "work_outpatient",  label: "診療：外来",          order: 1, isActive: true },
  { id: "work_surgery",     label: "診療：手術",          order: 2, isActive: true },
  { id: "work_delivery",    label: "診療：分娩・LDR",     order: 3, isActive: true },
  { id: "work_emergency",   label: "診療：救急・当直対応", order: 4, isActive: true },
  { id: "work_committee",   label: "院内業務・委員会",    order: 5, isActive: true },
  { id: "work_housework",   label: "家事",                order: 6, isActive: true },
  { id: "work_childcare",   label: "育児・家族時間",      order: 7, isActive: true },
  { id: "work_creative",    label: "クリエイティブ",      order: 8, isActive: true },
  { id: "work_info_search", label: "情報収集・物欲検索",  order: 9, isActive: true },
];
