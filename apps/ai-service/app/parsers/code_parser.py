import os
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

IGNORED_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".venv",
    "__pycache__",
    ".turbo",
    ".idea",
    ".vscode",
}

SUPPORTED_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".go",
    ".rs",
    ".json",
    ".md",
    ".html",
    ".css",
}


@dataclass
class CodeChunk:
    file_path: str
    code_snippet: str
    start_line: int
    end_line: int


class CodeParser:
    def __init__(self, chunk_size: int = 600, overlap: int = 100) -> None:
        self.chunk_size = chunk_size
        self.overlap = overlap

    def is_supported_file(self, filename: str) -> bool:
        _, ext = os.path.splitext(filename)
        return ext.lower() in SUPPORTED_EXTENSIONS

    def parse_directory(self, root_dir: str) -> list[CodeChunk]:
        all_chunks: list[CodeChunk] = []
        file_count = 0

        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune ignored directories in-place
            dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith(".")]

            for filename in filenames:
                if not self.is_supported_file(filename):
                    continue

                full_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(full_path, root_dir).replace("\\", "/")

                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()

                    if not lines:
                        continue

                    chunks = self.chunk_file(rel_path, lines)
                    all_chunks.extend(chunks)
                    file_count += 1
                except Exception as e:
                    logger.warning("Failed to parse file %s: %s", rel_path, str(e))

        logger.info("Parsed %d files into %d semantic code chunks", file_count, len(all_chunks))
        return all_chunks

    def chunk_file(self, rel_path: str, lines: list[str]) -> list[CodeChunk]:
        chunks: list[CodeChunk] = []
        total_lines = len(lines)

        current_snippet_lines: list[str] = []
        current_char_count = 0
        start_line = 1

        for idx, line in enumerate(lines, start=1):
            current_snippet_lines.append(line)
            current_char_count += len(line)

            if current_char_count >= self.chunk_size or idx == total_lines:
                snippet = "".join(current_snippet_lines).strip()
                if snippet:
                    chunks.append(
                        CodeChunk(
                            file_path=rel_path,
                            code_snippet=snippet,
                            start_line=start_line,
                            end_line=idx,
                        )
                    )

                # Prepare overlap for next chunk
                overlap_lines: list[str] = []
                overlap_chars = 0
                for prev_line in reversed(current_snippet_lines):
                    if overlap_chars + len(prev_line) <= self.overlap:
                        overlap_lines.insert(0, prev_line)
                        overlap_chars += len(prev_line)
                    else:
                        break

                current_snippet_lines = overlap_lines
                current_char_count = overlap_chars
                start_line = max(1, idx - len(overlap_lines) + 1)

        return chunks


code_parser = CodeParser()
