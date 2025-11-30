#!/bin/bash

# ==============================================================================
# Zeronotes API Test - User Login
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "User Login Test"

# Get email and password from arguments or use defaults
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"

print_info "Email: $EMAIL"
print_info "Password: ********"
echo ""

# Prepare request data
REQUEST_DATA=$(cat <<EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD"
}
EOF
)

# Make API request
print_request "POST" "$API_AUTH_URL/login"
echo ""

result=$(api_request "POST" "$API_AUTH_URL/login" "$REQUEST_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Print response body
print_color "${COLOR_BOLD}" "Response Body:"
print_json "$response"
echo ""

# Check if login was successful
if [ "$http_code" -eq 200 ]; then
    print_success "Login successful!"
    
    # Extract and save token
    if command -v jq &> /dev/null; then
        token=$(echo "$response" | jq -r '.token // empty')
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            save_token "$token"
            echo ""
            print_info "Token is now available for authenticated requests"
        fi
    fi
    
    echo ""
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./create-note.sh to create a note"
    print_color "${COLOR_WHITE}" "  • Run ./get-notes.sh to view all notes"
    exit 0
else
    print_error "Login failed!"
    if [ "$http_code" -eq 401 ]; then
        print_warning "Invalid credentials. Please check your email and password."
    fi
    exit 1
fi

