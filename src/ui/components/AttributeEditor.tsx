import type { AttributeType, ItemAttribute } from "../../domain";

interface AttributeEditorProps {
  attributes: ItemAttribute[];
  onChange: (attributes: ItemAttribute[]) => void;
}

const ATTRIBUTE_TYPES: AttributeType[] = ["text", "number", "date", "file"];

function generateAttributeId(): string {
  return crypto.randomUUID();
}

export function AttributeEditor({ attributes, onChange }: AttributeEditorProps) {
  const handleAdd = () => {
    const newAttribute: ItemAttribute = {
      id: generateAttributeId(),
      key: "",
      type: "text",
      value: "",
    };
    onChange([...attributes, newAttribute]);
  };

  const handleRemove = (id: string) => {
    onChange(attributes.filter((attr) => attr.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ItemAttribute, value: string) => {
    onChange(
      attributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    );
  };

  return (
    <div className="attribute-editor">
      <div className="attribute-editor-header">
        <span>Attributes</span>
        <button type="button" onClick={handleAdd} className="btn-add-attr">
          + Add Attribute
        </button>
      </div>

      {attributes.length > 0 && (
        <div className="attribute-rows">
          {attributes.map((attr) => (
            <div key={attr.id} className="attribute-row">
              <input
                type="text"
                placeholder="Key"
                value={attr.key}
                onChange={(e) => handleUpdate(attr.id, "key", e.target.value)}
                className="attr-key-input"
              />
              <select
                value={attr.type}
                onChange={(e) =>
                  handleUpdate(attr.id, "type", e.target.value as AttributeType)
                }
                className="attr-type-select"
              >
                {ATTRIBUTE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type={attr.type === "number" ? "number" : attr.type === "date" ? "date" : "text"}
                placeholder={attr.type === "file" ? "Filename" : "Value"}
                value={attr.value}
                onChange={(e) => handleUpdate(attr.id, "value", e.target.value)}
                className="attr-value-input"
              />
              <button
                type="button"
                onClick={() => handleRemove(attr.id)}
                className="btn-remove-attr"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
