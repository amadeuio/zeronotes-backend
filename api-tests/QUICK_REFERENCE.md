# Zeronotes API Test Suite - Quick Reference

## 🚀 Quick Start

```bash
cd api-tests
./register.sh              # Register a new user
./create-note.sh           # Create a note
./get-notes.sh             # View all notes
```

## 📋 All Commands

| Script             | Description           | Example                                       |
| ------------------ | --------------------- | --------------------------------------------- |
| `./register.sh`    | Register new user     | `./register.sh user@test.com pass123`         |
| `./login.sh`       | Login existing user   | `./login.sh user@test.com pass123`            |
| `./create-note.sh` | Create a note         | `./create-note.sh "" "Title" "Content"`       |
| `./get-notes.sh`   | List all notes        | `./get-notes.sh`                              |
| `./update-note.sh` | Update a note         | `./update-note.sh <ID> "New Title" "Content"` |
| `./delete-note.sh` | Delete a note         | `./delete-note.sh <ID> -y`                    |
| `./demo.sh`        | Run complete workflow | `./demo.sh`                                   |

## 🎯 Common Workflows

### First Time Setup

```bash
./register.sh                                    # Creates account & saves token
./create-note.sh "" "My Note" "Content here"    # Creates note
./get-notes.sh                                   # Lists notes
```

### Daily Testing

```bash
./login.sh user@test.com password               # Get fresh token
./create-note.sh                                # Quick note with defaults
./get-notes.sh                                  # See all notes
```

### Update & Delete

```bash
./get-notes.sh                                  # Get note ID
./update-note.sh <ID> "New Title" "New Content" # Update
./delete-note.sh <ID> -y                        # Delete (skip confirm)
```

## 🔧 Environment Variables

```bash
export API_BASE_URL="http://localhost:3000"     # Change API URL
export TOKEN_FILE="/tmp/my_token.txt"           # Change token location
```

## 💡 Pro Tips

- **Auto-generated IDs**: Leave first parameter empty in `create-note.sh`
- **Use saved IDs**: `update-note.sh` and `delete-note.sh` use last note ID if not specified
- **Skip confirmation**: Add `-y` flag to `delete-note.sh`
- **JSON formatting**: Install `jq` for beautiful output (`brew install jq`)
- **Batch operations**: Chain commands with `&&`

## 🎨 Output Colors

- 🟢 **Green**: Success (2xx responses)
- 🔴 **Red**: Errors (5xx responses)
- 🟡 **Yellow**: Warnings (4xx responses)
- 🔵 **Blue**: Info messages
- 🟣 **Magenta**: HTTP requests

## 📁 Persistent Files

- `/tmp/zeronotes_token.txt` - Auth token storage
- `/tmp/zeronotes_last_note_id.txt` - Last created/viewed note ID

## 🆘 Troubleshooting

| Issue                | Solution                      |
| -------------------- | ----------------------------- |
| "No token found"     | Run `./login.sh` first        |
| "Connection refused" | Start backend: `npm run dev`  |
| "Permission denied"  | Run `chmod +x *.sh`           |
| No JSON formatting   | Install jq: `brew install jq` |

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.
