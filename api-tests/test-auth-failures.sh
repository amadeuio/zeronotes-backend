#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Authentication Failure Scenarios
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Authentication Failure Tests"

# Test endpoint (using get-notes as it requires auth)
TEST_URL="$API_NOTES_URL/"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_auth_test() {
    local test_name=$1
    local auth_header=$2
    local expected_status=$3
    local description=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test $TOTAL_TESTS: $test_name"
    print_info "$description"
    echo ""
    
    local http_code
    local response
    local temp_file=$(mktemp)
    
    if [ -z "$auth_header" ]; then
        # No Authorization header
        http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
            -X "GET" \
            "$TEST_URL")
    else
        # With Authorization header
        http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
            -X "GET" \
            -H "Authorization: $auth_header" \
            "$TEST_URL")
    fi
    
    response=$(cat "$temp_file")
    rm -f "$temp_file"
    
    print_request "GET" "$TEST_URL"
    if [ -n "$auth_header" ]; then
        print_info "Authorization: ${auth_header:0:30}..."
    else
        print_info "Authorization: (none)"
    fi
    echo ""
    
    print_response_status "$http_code"
    
    if [ -n "$response" ]; then
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

# Function to create an expired token (simulated with expired timestamp)
create_expired_token() {
    # Create a JWT-like token with expired timestamp in payload
    # The signature will be invalid, but the structure tests expiration checking
    local header="eyJhbGciOiJIUzI1NiJ9"  # Standard HS256 header (base64)
    # Payload with expired timestamp (exp: 1 = Jan 1, 1970)
    local expired_payload=$(echo -n '{"userId":"test-user-id","iat":1000000000,"exp":1}' | base64 | tr -d '\n' | tr -d '=')
    # Invalid signature
    echo "${header}.${expired_payload}.expired_token_invalid_signature"
}

# Function to create token for non-existent user
create_wrong_user_token() {
    # Create a token structure for a user that doesn't exist
    # This will fail when the API tries to find the user
    local header="eyJhbGciOiJIUzI1NiJ9"  # Standard HS256 header
    local fake_user_id="00000000-0000-0000-0000-000000000000"
    local future_exp=$(( $(date +%s) + 3600 ))
    local payload=$(echo -n "{\"userId\":\"$fake_user_id\",\"iat\":$(date +%s),\"exp\":$future_exp}" | base64 | tr -d '\n' | tr -d '=')
    # Invalid signature (can't sign without secret)
    echo "${header}.${payload}.wrong_user_invalid_signature"
}

echo ""
print_info "Testing authentication failure scenarios..."
print_info "Endpoint: $TEST_URL"
echo ""
print_warning "Note: Some tests may show different error codes depending on implementation"
echo ""

# Test 1: No token
run_auth_test \
    "No Authorization Header" \
    "" \
    401 \
    "Request without Authorization header should be rejected"

# Test 2: Empty Bearer token
run_auth_test \
    "Empty Bearer Token" \
    "Bearer " \
    401 \
    "Request with empty Bearer token should be rejected"

# Test 3: Missing Bearer prefix
run_auth_test \
    "Missing Bearer Prefix" \
    "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0ZXN0In0.invalid" \
    401 \
    "Request without 'Bearer ' prefix should be rejected"

# Test 4: Random string as token
run_auth_test \
    "Random String Token" \
    "Bearer random_string_token_12345" \
    401 \
    "Random string as token should be rejected"

# Test 5: Malformed JWT (invalid structure)
run_auth_test \
    "Malformed JWT Structure" \
    "Bearer not.a.valid.jwt.structure" \
    401 \
    "Malformed JWT structure should be rejected"

# Test 6: Invalid JWT signature
run_auth_test \
    "Invalid JWT Signature" \
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.invalid_signature_here" \
    401 \
    "JWT with invalid signature should be rejected"

# Test 7: Expired token (simulated - structure with expired timestamp)
EXPIRED_TOKEN=$(create_expired_token)
run_auth_test \
    "Expired Token (Simulated)" \
    "Bearer $EXPIRED_TOKEN" \
    401 \
    "Token with expired timestamp should be rejected (signature will also fail)"

# Test 8: Token for non-existent user (simulated)
WRONG_USER_TOKEN=$(create_wrong_user_token)
run_auth_test \
    "Token for Non-existent User (Simulated)" \
    "Bearer $WRONG_USER_TOKEN" \
    401 \
    "Token for non-existent user should be rejected (signature will fail)"

# Test 9: Invalid base64 encoding
run_auth_test \
    "Invalid Base64 Encoding" \
    "Bearer invalid.base64.encoding!!!" \
    401 \
    "Invalid base64 encoding should be rejected"

# Test 10: Only one JWT part (should be 3 parts)
run_auth_test \
    "Incomplete JWT (One Part)" \
    "Bearer onlyonepart" \
    401 \
    "JWT with only one part should be rejected"

# Test 11: Only two JWT parts (should be 3 parts)
run_auth_test \
    "Incomplete JWT (Two Parts)" \
    "Bearer part1.part2" \
    401 \
    "JWT with only two parts should be rejected"

# Test 12: Valid-looking JWT but completely wrong format
run_auth_test \
    "Valid JWT Format But Wrong Content" \
    "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid" \
    401 \
    "JWT with valid structure but wrong algorithm/content should be rejected"

# Note: To test a REAL expired token, you would need to:
# 1. Get a valid token
# 2. Wait for it to expire (or modify server to use short expiration)
# 3. Use that expired token
# This is tested above with a simulated expired token structure

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
        print_success "All authentication failure tests passed! ✓"
        print_info "Your API is properly rejecting invalid authentication attempts."
        exit 0
    else
        print_warning "Some tests failed. Review the results above."
        print_info "Expected: All tests should return 401 (Unauthorized)"
        exit 1
    fi
else
    print_error "No tests were run!"
    exit 1
fi

