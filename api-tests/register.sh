#!/bin/bash

# ==============================================================================
# Zeronotes API Test - User Registration
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "User Registration Test"

# Get email and password from arguments or use defaults
EMAIL="${1:-test$(date +%s)@example.com}"
PASSWORD="${2:-password123}"

print_info "Email: $EMAIL"
print_info "Password: $PASSWORD"
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
print_request "POST" "$API_AUTH_URL/register"
echo ""

result=$(api_request "POST" "$API_AUTH_URL/register" "$REQUEST_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

# Print response status
print_response_status "$http_code"
echo ""

# Print response body
print_color "${COLOR_BOLD}" "Response Body:"
print_json "$response"
echo ""

# Check if registration was successful
if [ "$http_code" -eq 201 ]; then
    print_success "Registration successful!"
    
    # Extract and save token
    if command -v jq &> /dev/null; then
        token=$(echo "$response" | jq -r '.token // empty')
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            save_token "$token"
            echo ""
            print_info "You can now use the token for authenticated requests"
        fi
    fi
    
    echo ""
    print_info "Next steps:"
    print_color "${COLOR_WHITE}" "  • Run ./login.sh $EMAIL $PASSWORD to login"
    print_color "${COLOR_WHITE}" "  • Or use the saved token for authenticated requests"
    exit 0
else
    print_error "Registration failed!"
    exit 1
fi

