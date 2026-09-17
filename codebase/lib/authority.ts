/** Product boundary: ScriptScout drafts lesson material; a person approves publication. */
export function publicationBoundary(topic: string, learningObjective: string): string | null {
  const request = `${topic} ${learningObjective}`.toLocaleLowerCase('vi');
  const bypass = /bỏ qua.{0,30}(duyệt|phê duyệt)|không cần.{0,30}(duyệt|phê duyệt)|tự.{0,20}(phê duyệt|xuất bản|đăng bài)|thay.{0,20}(giảng viên|người duyệt)/i;
  if (!bypass.test(request)) return null;
  return 'ScriptScout chỉ tạo bản nháp. Giảng viên hoặc người có thẩm quyền phải xem, phê duyệt và quyết định xuất bản; ứng dụng không tự phê duyệt hoặc xuất bản.';
}
