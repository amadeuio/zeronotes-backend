#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Get All Notes
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Get All Notes Test"

# Check if token exists
if ! has_token; then
    print_error "No authentication token found!"
    print_warning "Please run ./login.sh first to authenticate"
    exit 1
fi

show_token_info
echo ""

# Make API request
print_request "GET" "$API_NOTES_URL/"
echo ""

result=$(api_request "GET" "$API_NOTES_URL/")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Check if request was successful
if [ "$http_code" -eq 200 ]; then
    # Print response body
    print_color "${COLOR_BOLD}" "Response Body:"
    print_json "$response"
    echo ""
    
    # Count notes
    if command -v jq &> /dev/null; then
        note_count=$(echo "$response" | jq '.notesOrder | length')
        print_success "Retrieved $note_count note(s)"
        
        # Display notes summary
        if [ "$note_count" -gt 0 ]; then
            echo ""
            print_color "${COLOR_BOLD}" "Notes Summary:"
            echo "$response" | jq -r '.notesOrder[] as $id | "  • [\($id | .[0:8])...] \(.notesById[$id].title // "(Untitled)")"'
            
            # Save first note ID for convenience
            first_note_id=$(echo "$response" | jq -r '.notesOrder[0] // empty')
            if [ -n "$first_note_id" ] && [ "$first_note_id" != "null" ]; then
                save_note_id "$first_note_id"
                echo ""
                print_info "First note ID saved: $first_note_id"
            fi
        fi
    else
        print_success "Notes retrieved successfully"
    fi
    
    echo ""
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./create-note.sh to create a new note"
    if [ -n "$first_note_id" ]; then
        print_color "${COLOR_WHITE}" "  • Run ./update-note.sh $first_note_id to update the first note"
        print_color "${COLOR_WHITE}" "  • Run ./delete-note.sh $first_note_id to delete the first note"
    fi
    exit 0
elif [ "$http_code" -eq 401 ]; then
    print_error "Authentication failed!"
    print_warning "Your token may have expired. Please run ./login.sh again."
    exit 1
else
    print_error "Failed to retrieve notes!"
    print_color "${COLOR_BOLD}" "Response Body:"
    print_json "$response"
    exit 1
fi

