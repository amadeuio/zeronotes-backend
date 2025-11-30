#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Update Note
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Update Note Test"

# Check if token exists
if ! has_token; then
    print_error "No authentication token found!"
    print_warning "Please run ./login.sh first to authenticate"
    exit 1
fi

show_token_info
echo ""

# Get note ID from argument or use saved one
NOTE_ID="${1:-$(load_note_id)}"

if [ -z "$NOTE_ID" ]; then
    print_error "No note ID provided and no saved note ID found!"
    print_warning "Usage: ./update-note.sh <NOTE_ID> [TITLE] [CONTENT]"
    print_warning "Or run ./get-notes.sh first to save a note ID"
    exit 1
fi

# Get updated title and content from arguments or use defaults
NEW_TITLE="${2:-Updated Note Title}"
NEW_CONTENT="${3:-This note was updated at $(date)}"

print_info "Note ID: $NOTE_ID"
print_info "New Title: $NEW_TITLE"
print_info "New Content: ${NEW_CONTENT:0:50}..."
echo ""

# Prepare request data
REQUEST_DATA=$(cat <<EOF
{
  "title": "$NEW_TITLE",
  "content": "$NEW_CONTENT"
}
EOF
)

# Make API request
print_request "PUT" "$API_NOTES_URL/$NOTE_ID"
echo ""

result=$(api_request "PUT" "$API_NOTES_URL/$NOTE_ID" "$REQUEST_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Print response body
print_color "${COLOR_BOLD}" "Response Body:"
print_json "$response"
echo ""

# Check if note update was successful
if [ "$http_code" -eq 200 ]; then
    print_success "Note updated successfully!"
    
    echo ""
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./get-notes.sh to view all notes"
    print_color "${COLOR_WHITE}" "  • Run ./delete-note.sh $NOTE_ID to delete this note"
    exit 0
elif [ "$http_code" -eq 401 ]; then
    print_error "Authentication failed!"
    print_warning "Your token may have expired. Please run ./login.sh again."
    exit 1
elif [ "$http_code" -eq 404 ]; then
    print_error "Note not found!"
    print_warning "The note with ID '$NOTE_ID' does not exist or you don't have access to it."
    exit 1
else
    print_error "Note update failed!"
    exit 1
fi

