#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Delete Note
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Delete Note Test"

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
    print_warning "Usage: ./delete-note.sh <NOTE_ID>"
    print_warning "Or run ./get-notes.sh first to save a note ID"
    exit 1
fi

print_info "Note ID: $NOTE_ID"
echo ""

# Confirmation prompt (can be skipped with -y flag)
if [ "$2" != "-y" ] && [ "$2" != "--yes" ]; then
    print_warning "Are you sure you want to delete this note? (y/N)"
    read -r confirmation
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        print_info "Delete operation cancelled"
        exit 0
    fi
    echo ""
fi

# Make API request
print_request "DELETE" "$API_NOTES_URL/$NOTE_ID"
echo ""

result=$(api_request "DELETE" "$API_NOTES_URL/$NOTE_ID")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Print response body (if any)
if [ -n "$response" ]; then
    print_color "${COLOR_BOLD}" "Response Body:"
    print_json "$response"
    echo ""
fi

# Check if note deletion was successful
if [ "$http_code" -eq 204 ]; then
    print_success "Note deleted successfully!"
    
    # Clear saved note ID if it matches
    saved_note_id=$(load_note_id)
    if [ "$saved_note_id" = "$NOTE_ID" ]; then
        rm -f "$LAST_NOTE_ID_FILE"
        print_info "Cleared saved note ID"
    fi
    
    echo ""
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./get-notes.sh to view remaining notes"
    print_color "${COLOR_WHITE}" "  • Run ./create-note.sh to create a new note"
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
    print_error "Note deletion failed!"
    exit 1
fi

