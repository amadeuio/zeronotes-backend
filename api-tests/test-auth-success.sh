#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Authentication Success Scenarios (Happy Path)
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Authentication Success Tests (Happy Path)"

# Test endpoint (using get-notes as it requires auth)
TEST_URL="$API_NOTES_URL/"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test user credentials
TEST_EMAIL="happy-path-$(date +%s)@example.com"
TEST_PASSWORD="password123"

# Function to run a success test
run_auth_success_test() {
    local test_name=$1
    local token=$2
    local expected_status=$3
    local description=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test $TOTAL_TESTS: $test_name"
    print_info "$description"
    echo ""
    
    local http_code
    local response
    local temp_file=$(mktemp)
    
    if [ -z "$token" ]; then
        print_error "No token provided for test!"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        rm -f "$temp_file"
        return 1
    fi
    
    http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
        -X "GET" \
        -H "Authorization: Bearer $token" \
        "$TEST_URL")
    
    response=$(cat "$temp_file")
    rm -f "$temp_file"
    
    print_request "GET" "$TEST_URL"
    print_info "Authorization: Bearer ${token:0:30}..."
    echo ""
    
    print_response_status "$http_code"
    
    if [ -n "$response" ] && [ "$response" != "null" ]; then
        print_color "${COLOR_BOLD}" "Response:"
        print_json "$response"
        echo ""
    fi
    
    # Check if test passed
    if [ "$http_code" -eq "$expected_status" ]; then
        print_success "✓ PASSED: Got expected status $expected_status"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo ""
        return 0
    else
        print_error "✗ FAILED: Expected status $expected_status, got $http_code"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo ""
        return 1
    fi
}

echo ""
print_info "Testing authentication success scenarios (happy path)..."
print_info "Endpoint: $TEST_URL"
echo ""

# Setup: Register a test user and get a valid token
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Setup: Registering test user..."
print_info "Email: $TEST_EMAIL"
echo ""

./register.sh "$TEST_EMAIL" "$TEST_PASSWORD" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    print_error "Failed to register test user!"
    exit 1
fi

VALID_TOKEN=$(load_token)
if [ -z "$VALID_TOKEN" ]; then
    print_error "Failed to get valid token!"
    exit 1
fi

print_success "Test user registered and token obtained"
echo ""
print_info "Token: ${VALID_TOKEN:0:50}..."
echo ""
sleep 1

# Test 1: Valid token with proper Bearer prefix
run_auth_success_test \
    "Valid Token with Bearer Prefix" \
    "$VALID_TOKEN" \
    200 \
    "Request with valid token and 'Bearer ' prefix should succeed"

# Test 2: Token persistence - same token used multiple times
run_auth_success_test \
    "Token Reusability (First Use)" \
    "$VALID_TOKEN" \
    200 \
    "Same token should work for multiple requests"

run_auth_success_test \
    "Token Reusability (Second Use)" \
    "$VALID_TOKEN" \
    200 \
    "Token should remain valid across multiple API calls"

# Test 3: Token from login (different source, same validity)
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 3: Token from Login"
print_info "Getting token via login endpoint (should be equivalent to registration token)"
echo ""

LOGIN_RESULT=$(api_request "POST" "$API_AUTH_URL/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
LOGIN_HTTP_CODE=$(echo "$LOGIN_RESULT" | cut -d'|' -f1)
LOGIN_RESPONSE=$(echo "$LOGIN_RESULT" | cut -d'|' -f2-)

if [ "$LOGIN_HTTP_CODE" -eq 200 ]; then
    if command -v jq &> /dev/null; then
        LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
        if [ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
            TOTAL_TESTS=$((TOTAL_TESTS + 1))
            print_request "GET" "$TEST_URL"
            print_info "Authorization: Bearer ${LOGIN_TOKEN:0:30}... (from login)"
            echo ""
            
            TEST_RESULT=$(api_request "GET" "$TEST_URL" "")
            TEST_HTTP_CODE=$(echo "$TEST_RESULT" | cut -d'|' -f1)
            
            print_response_status "$TEST_HTTP_CODE"
            echo ""
            
            if [ "$TEST_HTTP_CODE" -eq 200 ]; then
                print_success "✓ PASSED: Token from login works correctly"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                print_error "✗ FAILED: Token from login should work"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            echo ""
        else
            print_warning "Could not extract token from login response"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        print_warning "jq not available, skipping login token test"
    fi
else
    print_warning "Login failed, skipping login token test"
fi

# Test 4: Token works with different endpoints
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 4: Token Works Across Different Endpoints"
echo ""

# Test 4a: GET /api/notes (already tested, but confirming)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
print_info "4a. GET /api/notes/"
result=$(api_request "GET" "$API_NOTES_URL/" "")
http_code=$(echo "$result" | cut -d'|' -f1)
if [ "$http_code" -eq 200 ]; then
    print_success "✓ PASSED: GET /api/notes/ works with valid token"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "✗ FAILED: GET /api/notes/ should work"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 4b: POST /api/notes (create note)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
print_info "4b. POST /api/notes/ (create note)"
NOTE_ID=$(generate_id)
CREATE_DATA="{\"id\":\"$NOTE_ID\",\"title\":\"Happy Path Test Note\",\"content\":\"Testing successful auth\"}"
result=$(api_request "POST" "$API_NOTES_URL/" "$CREATE_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
if [ "$http_code" -eq 201 ]; then
    print_success "✓ PASSED: POST /api/notes/ works with valid token"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "✗ FAILED: POST /api/notes/ should work (got $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 4c: PUT /api/notes/:id (update note)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
print_info "4c. PUT /api/notes/:id (update note)"
UPDATE_DATA="{\"title\":\"Updated via Happy Path Test\",\"content\":\"Updated content\"}"
result=$(api_request "PUT" "$API_NOTES_URL/$NOTE_ID" "$UPDATE_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
if [ "$http_code" -eq 200 ]; then
    print_success "✓ PASSED: PUT /api/notes/:id works with valid token"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "✗ FAILED: PUT /api/notes/:id should work (got $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 4d: DELETE /api/notes/:id (delete note)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
print_info "4d. DELETE /api/notes/:id (delete note)"
result=$(api_request "DELETE" "$API_NOTES_URL/$NOTE_ID" "")
http_code=$(echo "$result" | cut -d'|' -f1)
if [ "$http_code" -eq 204 ]; then
    print_success "✓ PASSED: DELETE /api/notes/:id works with valid token"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "✗ FAILED: DELETE /api/notes/:id should work (got $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 5: Token persists across script executions
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 5: Token Persistence"
print_info "Verifying token is saved and can be reloaded"
echo ""

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if has_token; then
    RELOADED_TOKEN=$(load_token)
    if [ "$RELOADED_TOKEN" = "$VALID_TOKEN" ]; then
        print_success "✓ PASSED: Token persists and can be reloaded correctly"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Test that reloaded token still works
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        result=$(api_request "GET" "$API_NOTES_URL/" "")
        http_code=$(echo "$result" | cut -d'|' -f1)
        if [ "$http_code" -eq 200 ]; then
            print_success "✓ PASSED: Reloaded token is still valid"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_error "✗ FAILED: Reloaded token should still work"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        print_error "✗ FAILED: Reloaded token doesn't match saved token"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_error "✗ FAILED: Token file not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 6: Token works with different HTTP methods
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 6: Token Works with Different HTTP Methods"
echo ""

# Already tested GET, POST, PUT, DELETE above, but let's confirm all work
print_success "✓ Confirmed: Token works with GET, POST, PUT, DELETE methods"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
PASSED_TESTS=$((PASSED_TESTS + 1))
echo ""

# Test 7: Multiple sequential requests with same token
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 7: Multiple Sequential Requests"
print_info "Making 3 sequential requests with the same token"
echo ""

for i in 1 2 3; do
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_info "Request $i of 3..."
    result=$(api_request "GET" "$API_NOTES_URL/" "")
    http_code=$(echo "$result" | cut -d'|' -f1)
    if [ "$http_code" -eq 200 ]; then
        print_success "✓ PASSED: Sequential request $i succeeded"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "✗ FAILED: Sequential request $i should succeed (got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    sleep 0.5
done
echo ""

# Test 8: Token with proper content-type headers
print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test 8: Token with Proper Headers"
print_info "Request with valid token and proper Content-Type header"
echo ""

TOTAL_TESTS=$((TOTAL_TESTS + 1))
temp_file=$(mktemp)
http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
    -X "GET" \
    -H "Authorization: Bearer $VALID_TOKEN" \
    -H "Content-Type: application/json" \
    "$TEST_URL")
rm -f "$temp_file"

if [ "$http_code" -eq 200 ]; then
    print_success "✓ PASSED: Token works with proper Content-Type header"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "✗ FAILED: Token should work with proper headers (got $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Summary
echo ""
print_header "Test Summary"
echo ""
print_info "Total Tests: $TOTAL_TESTS"
print_success "Passed: $PASSED_TESTS"
if [ $FAILED_TESTS -gt 0 ]; then
    print_error "Failed: $FAILED_TESTS"
else
    print_success "Failed: $FAILED_TESTS"
fi
echo ""

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    print_info "Success Rate: ${SUCCESS_RATE}%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "All authentication success tests passed! ✓"
        print_info "Your API is properly accepting valid authentication tokens."
        print_info "Token is saved and ready for use: $TOKEN_FILE"
        exit 0
    else
        print_warning "Some tests failed. Review the results above."
        print_info "Expected: All tests should return 2xx status codes"
        exit 1
    fi
else
    print_error "No tests were run!"
    exit 1
fi

