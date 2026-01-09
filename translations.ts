
export type Language = 'en' | 'vi';

export const translations = {
  en: {
    // Tabs (Removed unused)
    tabEdit: "Edit Mode",
    
    // Edit Mode
    performEdit: "Perform Edit",
    editInstructions: "Draw arrows and add text notes to the image to guide the AI.",
    toolArrow: "Draw Arrow",
    toolText: "Add Text",
    toolClear: "Clear All",
    saveEdit: "Complete",
    cancelEdit: "Cancel",
    editSubtitle: "Upload an image, mark changes, and let AI refine it.",
    additionalPrompt: "Additional Instructions",
    additionalPromptPlaceholder: "E.g., Change the flowers to red, remove the chair...",
    annotatedImage: "Annotated Image",
    textInputPlaceholder: "Type text here...",

    // UI Elements
    title: "DreamDay AI",
    subtitle: "Wedding Visualizer",
    activeModel: "Gemini 2.5 Flash Image Active",
    designStudio: "Image Editor",
    
    // Common
    generateEdit: "Generate Edit",
    rendering: "Rendering...",
    generating: "Generating...",
    uploadSketch: "Upload Image",
    dragDrop: "Drag & drop or click to browse",
    supports: "Supports JPG, PNG",
    originalSketch: "Original / Input",
    removeChange: "Remove / Change",
    download: "Download 8K",
    configurePrompt: "\"Annotate image and click Generate\"",
    processingEdit: "Reading your visual notes and applying changes...",
    renderComplete: "Render Complete",
    error: "Generation failed. Please check API key or file format.",
    downloadBtn: "Download",
    editBtn: "Refine Result",
    
    // Options
    imageSettings: "Render Settings",
    numberOfImages: "Number of Images",
  },
  vi: {
    // Tabs (Removed unused)
    tabEdit: "Chế độ Chỉnh sửa",

    // Edit Mode
    performEdit: "Thực hiện chỉnh sửa",
    editInstructions: "Vẽ mũi tên và thêm ghi chú văn bản lên ảnh để hướng dẫn AI.",
    toolArrow: "Vẽ Mũi tên",
    toolText: "Thêm Chữ",
    toolClear: "Xóa tất cả",
    saveEdit: "Hoàn tất",
    cancelEdit: "Hủy",
    editSubtitle: "Tải ảnh, đánh dấu thay đổi và để AI hoàn thiện.",
    additionalPrompt: "Hướng dẫn bổ sung",
    additionalPromptPlaceholder: "VD: Đổi hoa thành màu đỏ, bỏ cái ghế này đi...",
    annotatedImage: "Ảnh đã ghi chú",
    textInputPlaceholder: "Nhập nội dung...",

    // UI Elements
    title: "DreamDay AI",
    subtitle: "Diễn họa Tiệc cưới",
    activeModel: "Gemini 2.5 Flash Image Đang chạy",
    designStudio: "Trình Chỉnh Sửa Ảnh",
    
    // Common
    generateEdit: "Tạo Ảnh Chỉnh Sửa",
    rendering: "Đang vẽ...",
    generating: "Đang tạo...",
    uploadSketch: "Tải lên ảnh",
    dragDrop: "Kéo thả hoặc nhấn để chọn ảnh",
    supports: "Hỗ trợ JPG, PNG",
    originalSketch: "Ảnh gốc",
    removeChange: "Xóa / Thay đổi",
    download: "Tải xuống 8K",
    configurePrompt: "\"Vẽ ghi chú lên ảnh và nhấn Tạo\"",
    processingEdit: "Đang đọc các ghi chú hình ảnh và thực hiện thay đổi...",
    renderComplete: "Hoàn tất",
    error: "Thất bại. Vui lòng kiểm tra API key hoặc định dạng tệp.",
    downloadBtn: "Tải xuống",
    editBtn: "Chỉnh sửa tiếp",
    
    // Options
    imageSettings: "Cài đặt Render",
    numberOfImages: "Số lượng ảnh",
  }
};
