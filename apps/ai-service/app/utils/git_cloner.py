import os
import shutil
import tempfile
import zipfile
import subprocess
import logging

logger = logging.getLogger(__name__)

TEMP_BASE_DIR = os.path.join(tempfile.gettempdir(), "devsync_rag")


def get_workspace_dir(workspace_id: str) -> str:
    """Return dedicated temporary directory path for a workspace."""
    os.makedirs(TEMP_BASE_DIR, exist_ok=True)
    return os.path.join(TEMP_BASE_DIR, workspace_id)


def unpack_zip_bytes(zip_bytes: bytes, workspace_id: str) -> str:
    """Extract uploaded ZIP file bytes to workspace directory."""
    target_dir = get_workspace_dir(workspace_id)
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir, ignore_errors=True)
    os.makedirs(target_dir, exist_ok=True)

    zip_path = os.path.join(TEMP_BASE_DIR, f"{workspace_id}.zip")
    with open(zip_path, "wb") as f:
        f.write(zip_bytes)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(target_dir)

    if os.path.exists(zip_path):
        os.remove(zip_path)

    logger.info("Unpacked ZIP archive for workspace %s into %s", workspace_id, target_dir)
    return target_dir


def clone_git_repo(git_url: str, workspace_id: str) -> str:
    """Clone a public Git repository into workspace directory."""
    target_dir = get_workspace_dir(workspace_id)
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir, ignore_errors=True)

    logger.info("Cloning Git repository %s into %s", git_url, target_dir)
    subprocess.run(
        ["git", "clone", "--depth", "1", git_url, target_dir],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return target_dir
