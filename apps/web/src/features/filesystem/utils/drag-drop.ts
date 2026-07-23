// =============================================================================
// DevSync AI — HTML5 Drag and Drop Handler Architecture
// =============================================================================

export interface DragItem {
  id: string;
  type: 'file' | 'folder';
  name: string;
}

export function handleDragStart(e: React.DragEvent, item: DragItem): void {
  e.dataTransfer.setData('text/plain', JSON.stringify(item));
  e.dataTransfer.effectAllowed = 'move';
}

export function handleDragOver(e: React.DragEvent): void {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function parseDragItem(e: React.DragEvent): DragItem | null {
  try {
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return null;
    return JSON.parse(raw) as DragItem;
  } catch {
    return null;
  }
}
