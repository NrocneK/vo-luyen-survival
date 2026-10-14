"""Đóng gói bộ PNG/JSON đã xuất và tài liệu bàn giao; không tạo ảnh."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def create_package():
    candidates = list((ROOT/"public/assets").rglob("*"))
    candidates += list((ROOT/"art/prompts").glob("*.txt"))
    candidates += [ROOT/"art/ASSET_PREVIEW.html", ROOT/"art/production-spec.json",
                   ROOT/"art/preview/qa-report.json", ROOT/"art/preview/browser-qa.json",
                   ROOT/"docs/ASSET_MANIFEST.md", ROOT/"docs/ART_GUIDE.md",
                   ROOT/"docs/ASSET_V2_REPAIR.md", ROOT/"README.md"]
    destination = ROOT/"art/stage0-assets.zip"
    with zipfile.ZipFile(destination,"w",zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(set(candidates)):
            if path.is_file():
                archive.write(path,path.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None, "ZIP bị lỗi"
        assert len(archive.namelist()) == len(set(archive.namelist())), "ZIP có mục trùng tên"
        return {"zip":str(destination),"entries":len(archive.namelist()),"bytes":destination.stat().st_size}

if __name__ == "__main__":
    print(create_package())
