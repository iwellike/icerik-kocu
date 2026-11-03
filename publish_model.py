"""Hugging Face model reposunu oluşturur/günceller ve model/ içeriğini yükler.

Çalıştırma: .venv/Scripts/python publish_model.py
"""
import sys
from pathlib import Path

from huggingface_hub import HfApi

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

MODEL_DIR = Path(__file__).resolve().parent / "model"
REPO_NAME = "icerik-kocu-kotu-son-riski"


def main():
    api = HfApi()
    kullanici = api.whoami()["name"]
    repo_id = f"{kullanici}/{REPO_NAME}"

    api.create_repo(repo_id, repo_type="model", exist_ok=True, private=False)
    for dosya in ["model.onnx", "config.json", "README.md"]:
        api.upload_file(
            path_or_fileobj=str(MODEL_DIR / dosya),
            path_in_repo=dosya,
            repo_id=repo_id,
            commit_message=f"v2.0: {dosya} güncelle",
        )

    bilgi = api.repo_info(repo_id)
    print(f"REPO_ID={repo_id}")
    print(f"COMMIT_SHA={bilgi.sha}")
    print(f"RESOLVE_URL=https://huggingface.co/{repo_id}/resolve/{bilgi.sha}/model.onnx")


if __name__ == "__main__":
    main()
