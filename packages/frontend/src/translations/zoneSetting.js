/**
 * Translations for ZoneSetting component (vi / en).
 * Keys match the labels used in the component.
 */
export const zoneSettingTranslations = {
  vi: {
    title: 'Quản lý khu vực',
    create: 'Tạo khu vực',
    edit: 'Sửa',
    update: 'Cập nhật',
    delete: 'Xóa',
    members: 'Thành viên',
    actions: 'Thao tác',
    name: 'Tên',
    cancel: 'Hủy',
    loading: 'Đang tải...',
    saving: 'Đang lưu...',
    searchPlaceholder: 'Tìm khu vực...',
    readonlyMessage: 'Bạn không có quyền quản lý khu vực.',
    membersModalTitle: 'Quản lý thành viên khu vực',
    membersSearchPlaceholder: 'Tìm theo tên thành viên...',
    all: 'Tất cả',
    assigned: 'Đã gán',
    unassigned: 'Chưa gán',
    status: 'Trạng thái',
    assign: 'Gán',
    remove: 'Gỡ',
    close: 'Đóng',
    confirmDelete: 'Xóa khu vực "{{name}}"?' 
  },
  en: {
    title: 'Manage Zones',
    create: 'Create Zone',
    edit: 'Edit',
    update: 'Update',
    delete: 'Delete',
    members: 'Members',
    actions: 'Actions',
    name: 'Name',
    cancel: 'Cancel',
    loading: 'Loading...',
    saving: 'Saving...',
    searchPlaceholder: 'Search zones...',
    readonlyMessage: 'You do not have permission to manage zones.',
    membersModalTitle: 'Manage Zone Members',
    membersSearchPlaceholder: 'Search by member name...',
    all: 'All',
    assigned: 'Assigned',
    unassigned: 'Unassigned',
    status: 'Status',
    assign: 'Assign',
    remove: 'Remove',
    close: 'Close',
    confirmDelete: 'Delete zone "{{name}}"?'
  }
}

export function getZoneSettingT (lang, key, vars = {}) {
  const LANG = zoneSettingTranslations[lang] || zoneSettingTranslations.en
  let s = LANG[key] ?? zoneSettingTranslations.en[key] ?? key
  Object.keys(vars).forEach(k => {
    s = s.replace(new RegExp(`{{${k}}}`, 'g'), vars[k])
  })
  return s
}
