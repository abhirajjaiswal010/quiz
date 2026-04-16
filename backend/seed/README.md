# Question Data Format (JSON)

This repository uses a structured JSON format for bulk uploading and seeding the Question Bank.

## Basic Structure

Each question is an object within a JSON array:

```json
[
  {
    "question": "A string containing the question text.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The exact string matching one of the options."
  }
]
```

## Adding Code Snippets

The system supports **Markdown-style fenced code blocks** within the `question` field. The frontend will automatically render these with syntax highlighting and monospace formatting.

### Critical Rules for JSON Strings:
1. **Newlines**: Use `\n` to indicate a new line.
2. **Escaping**: If your code contains double quotes ( `"` ), you must escape them with a backslash ( `\"` ).
3. **Fencing**: Wrap your code in triple backticks ( ` ``` ` ).

### Example with Code:

```json
{
  "question": "What is the output of the following JavaScript snippet?\n\n```javascript\nconst x = [1, 2, 3];\nconst y = x.map(n => n * 2);\nconsole.log(y[1]);\n```",
  "options": [
    "1",
    "2",
    "4",
    "6"
  ],
  "answer": "4"
}
```

## Field Specifications

| Field | Type | Description |
| :--- | :--- | :--- |
| `question` | `string` | The challenge text. Can include markers for code blocks and manual newlines (`\n`). |
| `options` | `array` | A list of exactly 4 strings. They will be labeled A, B, C, D in order. |
| `answer` | `string` | **MUST** exactly match the text of the correct option string. |

## Tips for Premium Display
- **Bold/Green Answers**: You don't need to specify colors in JSON. The Admin Panel automatically highlights the correct answer in Green and Bold based on the `answer` field match.
- **Language Labels**: Use the language identifier after the first triple backtick (e.g., ` ```python`, ` ```c`, ` ```javascript`) to show a specific label in the UI.
- **Monospace Everywhere**: Code blocks automatically use a premium monospace font and dark background for maximum readability.
