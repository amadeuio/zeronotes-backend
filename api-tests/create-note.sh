#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Create Note
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Create Note Test"

# Check if token exists
if ! has_token; then
    print_error "No authentication token found!"
    print_warning "Please run ./login.sh first to authenticate"
    exit 1
fi

show_token_info
echo ""

# Get note details from arguments or use defaults
NOTE_ID="${1:-$(generate_id)}"
NOTE_TITLE="${2:-My Test Note}"
NOTE_CONTENT="${3:-This is a test note created at $(date)}"

print_info "Note ID: $NOTE_ID"
print_info "Title: $NOTE_TITLE"
print_info "Content: ${NOTE_CONTENT:0:50}..."
echo ""

# Prepare request data
REQUEST_DATA=$(cat <<EOF
{
  "id": "$NOTE_ID",
  "title": "$NOTE_TITLE",
  "content": "$NOTE_CONTENT"
}
EOF
)

# Make API request
print_request "POST" "$API_NOTES_URL/"
echo ""

result=$(api_request "POST" "$API_NOTES_URL/" "$REQUEST_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Print response body
print_color "${COLOR_BOLD}" "Response Body:"
print_json "$response"
echo ""

# Check if note creation was successful
if [ "$http_code" -eq 201 ]; then
    print_success "Note created successfully!"
    
    # Save note ID for future use
    if command -v jq &> /dev/null; then
        note_id=$(echo "$response" | jq -r '.id // empty')
        if [ -z "$note_id" ] || [ "$note_id" = "null" ]; then
            note_id="$NOTE_ID"
        fi
    else
        note_id="$NOTE_ID"
    fi
    
    save_note_id "$note_id"
    echo ""
    
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./get-notes.sh to view all notes"
    print_color "${COLOR_WHITE}" "  • Run ./update-note.sh $note_id to update this note"
    print_color "${COLOR_WHITE}" "  • Run ./delete-note.sh $note_id to delete this note"
    exit 0
elif [ "$http_code" -eq 401 ]; then
    print_error "Authentication failed!"
    print_warning "Your token may have expired. Please run ./login.sh again."
    exit 1
else
    print_error "Note creation failed!"
    exit 1
fi

