#!/bin/bash

# ==============================================================================
# Zeronotes API Test Suite - Environment Configuration
# ==============================================================================

# API Configuration
export API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
export API_AUTH_URL="${API_BASE_URL}/api/auth"
export API_NOTES_URL="${API_BASE_URL}/api/notes"
export API_LABELS_URL="${API_BASE_URL}/api/labels"

# Token Storage (in api-tests/state directory for easy visibility)
SCRIPT_DIR_FOR_ENV="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-$SCRIPT_DIR_FOR_ENV/state}"
mkdir -p "$STATE_DIR" 2>/dev/null
export TOKEN_FILE="${TOKEN_FILE:-$STATE_DIR/token.txt}"
export LAST_NOTE_ID_FILE="${LAST_NOTE_ID_FILE:-$STATE_DIR/last_note_id.txt}"

# Color Codes
export COLOR_RESET='\033[0m'
export COLOR_RED='\033[0;31m'
export COLOR_GREEN='\033[0;32m'
export COLOR_YELLOW='\033[0;33m'
export COLOR_BLUE='\033[0;34m'
export COLOR_MAGENTA='\033[0;35m'
export COLOR_CYAN='\033[0;36m'
export COLOR_WHITE='\033[0;37m'
export COLOR_BOLD='\033[1m'

# ==============================================================================
# Utility Functions
# ==============================================================================

# Print colored message
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${COLOR_RESET}"
}

# Print section header
print_header() {
    echo ""
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "  $1"
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Print success message
print_success() {
    print_color "${COLOR_GREEN}" "✓ $1"
}

# Print error message
print_error() {
    print_color "${COLOR_RED}" "✗ $1"
}

# Print warning message
print_warning() {
    print_color "${COLOR_YELLOW}" "⚠ $1"
}

# Print info message
print_info() {
    print_color "${COLOR_BLUE}" "ℹ $1"
}

# Print request details
print_request() {
    local method=$1
    local url=$2
    print_color "${COLOR_MAGENTA}" "→ ${method} ${url}"
}

# Print response status
print_response_status() {
    local status=$1
    if [ $status -ge 200 ] && [ $status -lt 300 ]; then
        print_color "${COLOR_GREEN}" "← Status: ${status}"
    elif [ $status -ge 400 ] && [ $status -lt 500 ]; then
        print_color "${COLOR_YELLOW}" "← Status: ${status}"
    else
        print_color "${COLOR_RED}" "← Status: ${status}"
    fi
}

# Pretty print JSON response
print_json() {
    local json=$1
    if command -v jq &> /dev/null; then
        echo "$json" | jq -C '.'
    else
        echo "$json" | python3 -m json.tool 2>/dev/null || echo "$json"
    fi
}

# Save token to file
save_token() {
    local token=$1
    echo "$token" > "$TOKEN_FILE"
    print_success "Token saved to $TOKEN_FILE"
}

# Load token from file
load_token() {
    if [ -f "$TOKEN_FILE" ]; then
        cat "$TOKEN_FILE"
    else
        echo ""
    fi
}

# Check if token exists
has_token() {
    [ -f "$TOKEN_FILE" ] && [ -s "$TOKEN_FILE" ]
}

# Clear token
clear_token() {
    rm -f "$TOKEN_FILE"
    print_info "Token cleared"
}

# Save last note ID
save_note_id() {
    local note_id=$1
    echo "$note_id" > "$LAST_NOTE_ID_FILE"
}

# Load last note ID
load_note_id() {
    if [ -f "$LAST_NOTE_ID_FILE" ]; then
        cat "$LAST_NOTE_ID_FILE"
    else
        echo ""
    fi
}

# Make authenticated API request
api_request() {
    local method=$1
    local url=$2
    local data=$3
    local token=$(load_token)
    
    local http_code
    local response
    local temp_file=$(mktemp)
    
    if [ -n "$data" ]; then
        if [ -n "$token" ]; then
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$url")
        else
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$url")
        fi
    else
        if [ -n "$token" ]; then
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -X "$method" \
                -H "Authorization: Bearer $token" \
                "$url")
        else
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -X "$method" \
                "$url")
        fi
    fi
    
    response=$(cat "$temp_file")
    rm -f "$temp_file"
    
    echo "$http_code|$response"
}

# Parse API response
parse_response() {
    local result=$1
    local http_code=$(echo "$result" | cut -d'|' -f1)
    local response=$(echo "$result" | cut -d'|' -f2-)
    
    echo "$http_code"
    echo "$response"
}

# Check if jq is installed
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. JSON output will not be formatted."
        print_info "Install jq: brew install jq (macOS) or apt-get install jq (Linux)"
        echo ""
    fi
}

# Generate random ID
generate_id() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        cat /dev/urandom | LC_ALL=C tr -dc 'a-f0-9' | fold -w 32 | head -n 1 | sed 's/\(........\)\(....\)\(....\)\(....\)\(............\)/\1-\2-\3-\4-\5/'
    fi
}

# Display token info
show_token_info() {
    if has_token; then
        local token=$(load_token)
        print_info "Token: ${token:0:20}..."
    else
        print_warning "No token found. Please run login.sh first."
    fi
}

# Export functions for use in other scripts
export -f print_color
export -f print_header
export -f print_success
export -f print_error
export -f print_warning
export -f print_info
export -f print_request
export -f print_response_status
export -f print_json
export -f save_token
export -f load_token
export -f has_token
export -f clear_token
export -f save_note_id
export -f load_note_id
export -f api_request
export -f parse_response
export -f check_dependencies
export -f generate_id
export -f show_token_info

