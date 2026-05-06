import { useRef, useState } from "react";

type Props = {
  multiple?: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
  hint?: string;
  uploading?: boolean;
};

export default function ImageDropzone({ multiple, onFiles, hint, uploading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length) await onFiles(arr);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition select-none ${
        drag
          ? "border-[hsl(var(--green-mid))] bg-[hsl(var(--green-pale))]"
          : "border-[hsl(var(--green-pale))] hover:border-[hsl(var(--green-mid))] hover:bg-[hsl(var(--green-pale))]/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-gradient-brand grid place-items-center text-white shadow-glow">
          <i className={`fa-solid ${uploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"} text-2xl`} />
        </div>
        <div className="text-sm font-bold text-[hsl(var(--green-dark))]">
          {uploading ? "Đang tải lên..." : "Kéo & thả ảnh vào đây"}
        </div>
        <div className="text-xs text-muted-foreground">
          hoặc <span className="underline font-semibold">bấm để chọn tệp</span>
          {multiple ? " (chọn nhiều ảnh)" : ""}
        </div>
        {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
      </div>
    </div>
  );
}
