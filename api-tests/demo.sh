#!/bin/bash

# ==============================================================================
# Zeronotes API Test Suite - Automated Full Workflow
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

print_header "Zeronotes API Test Suite - Automated Full Workflow"

# Generate unique email for this test run
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="password123"

echo ""
print_info "Running complete automated workflow..."
print_info "Test email: $TEST_EMAIL"
echo ""

# Step 1: Register
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 1: User Registration"
./register.sh "$TEST_EMAIL" "$TEST_PASSWORD"
if [ $? -ne 0 ]; then
    print_error "Registration failed! Exiting..."
    exit 1
fi
echo ""
sleep 1

# Step 2: Create first note
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 2: Create First Note"
./create-note.sh "$(generate_id)" "Shopping List" "Buy milk, eggs, and bread"
if [ $? -ne 0 ]; then
    print_error "Note creation failed! Exiting..."
    exit 1
fi
echo ""
sleep 1

# Step 3: Create second note
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 3: Create Second Note"
./create-note.sh "$(generate_id)" "Meeting Notes" "Discuss Q4 goals and project timeline"
if [ $? -ne 0 ]; then
    print_error "Note creation failed! Exiting..."
    exit 1
fi
echo ""
sleep 1

# Step 4: Get all notes
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 4: Get All Notes"
./get-notes.sh
if [ $? -ne 0 ]; then
    print_error "Failed to retrieve notes! Exiting..."
    exit 1
fi
echo ""
sleep 1

# Step 5: Update a note
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 5: Update a Note"
NOTE_ID=$(load_note_id)
if [ -z "$NOTE_ID" ]; then
    print_warning "No note ID found, skipping update..."
else
    ./update-note.sh "$NOTE_ID" "Updated Shopping List" "Buy milk, eggs, bread, and cheese"
    if [ $? -ne 0 ]; then
        print_error "Note update failed! Continuing..."
    fi
fi
echo ""
sleep 1

# Step 6: Get notes again to see the update
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 6: View Updated Notes"
./get-notes.sh
echo ""
sleep 1

# Step 7: Delete a note
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 7: Delete a Note"
NOTE_ID=$(load_note_id)
if [ -z "$NOTE_ID" ]; then
    print_warning "No note ID found, skipping delete..."
else
    ./delete-note.sh "$NOTE_ID" -y
    if [ $? -ne 0 ]; then
        print_error "Note deletion failed! Continuing..."
    fi
fi
echo ""
sleep 1

# Step 8: Final view
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Step 8: View Remaining Notes"
./get-notes.sh
echo ""

# Summary
print_header "Workflow Complete!"
print_success "Successfully completed automated workflow:"
print_color "${COLOR_WHITE}" "  ✓ User registration ($TEST_EMAIL)"
print_color "${COLOR_WHITE}" "  ✓ Note creation (2 notes)"
print_color "${COLOR_WHITE}" "  ✓ Listing notes"
print_color "${COLOR_WHITE}" "  ✓ Updating a note"
print_color "${COLOR_WHITE}" "  ✓ Deleting a note"
print_color "${COLOR_WHITE}" "  ✓ Token persistence throughout"
echo ""

print_info "Token saved at: $TOKEN_FILE"
print_info "You can continue testing with individual scripts!"
echo ""
