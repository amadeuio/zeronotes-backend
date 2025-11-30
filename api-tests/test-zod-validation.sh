#!/bin/bash

# ==============================================================================
# Zeronotes API Test - Zod Validation Tests
# ==============================================================================

# Load environment and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Check dependencies
check_dependencies

# Print header
print_header "Zod Validation Tests"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a validation test
run_validation_test() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local description=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_color "${COLOR_BOLD}${COLOR_CYAN}" "Test $TOTAL_TESTS: $test_name"
    print_info "$description"
    echo ""
    
    result=$(api_request "$method" "$endpoint" "$data")
    http_code=$(echo "$result" | cut -d'|' -f1)
    response=$(echo "$result" | cut -d'|' -f2-)
    
    print_request "$method" "$endpoint"
    print_color "${COLOR_BOLD}" "Request Body:"
    print_json "$data"
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

echo ""
print_info "Testing Zod validation on various endpoints..."
echo ""

# ============================================================================
# User/Auth Validation Tests
# ============================================================================

print_color "${COLOR_BOLD}${COLOR_YELLOW}" "=== User/Auth Validation Tests ==="
echo ""

# Test 1: Missing email in registration
run_validation_test \
    "Registration: Missing Email" \
    "POST" \
    "$API_AUTH_URL/register" \
    '{"password":"password123"}' \
    400 \
    "Registration without email should fail validation"

# Test 2: Invalid email format
run_validation_test \
    "Registration: Invalid Email Format" \
    "POST" \
    "$API_AUTH_URL/register" \
    '{"email":"not-an-email","password":"password123"}' \
    400 \
    "Registration with invalid email format should fail validation"

# Test 3: Password too short
run_validation_test \
    "Registration: Password Too Short" \
    "POST" \
    "$API_AUTH_URL/register" \
    '{"email":"test@example.com","password":"short"}' \
    400 \
    "Registration with password less than 8 characters should fail"

# Test 4: Missing password in login
run_validation_test \
    "Login: Missing Password" \
    "POST" \
    "$API_AUTH_URL/login" \
    '{"email":"test@example.com"}' \
    400 \
    "Login without password should fail validation"

# Test 5: Invalid email in login
run_validation_test \
    "Login: Invalid Email" \
    "POST" \
    "$API_AUTH_URL/login" \
    '{"email":"invalid-email","password":"password123"}' \
    400 \
    "Login with invalid email format should fail validation"

# ============================================================================
# Note Validation Tests (with authentication)
# ============================================================================

print_color "${COLOR_BOLD}${COLOR_YELLOW}" "=== Note Validation Tests ==="
echo ""

# First, try to get a token (register a new user)
TEST_EMAIL="validtest$(date +%s)@example.com"
TEST_PASSWORD="password123"
REGISTER_DATA="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
result=$(api_request "POST" "$API_AUTH_URL/register" "$REGISTER_DATA")
http_code=$(echo "$result" | cut -d'|' -f1)
response=$(echo "$result" | cut -d'|' -f2-)

if [ "$http_code" -eq 201 ]; then
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$response" | jq -r '.token // empty')
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            save_token "$TOKEN"
            print_success "✓ Got authentication token for note tests"
            echo ""
            
            # Test 6: Create note with missing ID
            run_validation_test \
                "Create Note: Missing ID" \
                "POST" \
                "$API_NOTES_URL/" \
                '{"title":"Test Note"}' \
                400 \
                "Creating note without ID should fail validation"
            
            # Test 7: Create note with invalid UUID
            run_validation_test \
                "Create Note: Invalid UUID" \
                "POST" \
                "$API_NOTES_URL/" \
                '{"id":"not-a-uuid","title":"Test Note"}' \
                400 \
                "Creating note with invalid UUID should fail validation"
            
            # Test 8: Create note with title too long
            LONG_TITLE=$(printf '%*s' 501 | tr ' ' 'a')
            run_validation_test \
                "Create Note: Title Too Long" \
                "POST" \
                "$API_NOTES_URL/" \
                "{\"id\":\"$(uuidgen)\",\"title\":\"$LONG_TITLE\"}" \
                400 \
                "Creating note with title over 500 characters should fail"
            
            # Test 9: Reorder notes with empty array
            run_validation_test \
                "Reorder Notes: Empty Array" \
                "POST" \
                "$API_NOTES_URL/reorder" \
                '{"noteIds":[]}' \
                400 \
                "Reordering with empty array should fail validation"
            
            # Test 10: Reorder notes with invalid UUIDs
            run_validation_test \
                "Reorder Notes: Invalid UUIDs" \
                "POST" \
                "$API_NOTES_URL/reorder" \
                '{"noteIds":["not-uuid-1","not-uuid-2"]}' \
                400 \
                "Reordering with invalid UUIDs should fail validation"
        else
            print_warning "Could not extract token. Skipping authenticated tests."
        fi
    else
        print_warning "jq not installed. Skipping authenticated tests."
    fi
else
    print_warning "Could not register test user. Skipping authenticated tests."
fi

# ============================================================================
# Label Validation Tests (with authentication)
# ============================================================================

print_color "${COLOR_BOLD}${COLOR_YELLOW}" "=== Label Validation Tests ==="
echo ""

if [ -n "$TOKEN" ]; then
    # Test 11: Create label with missing ID
    run_validation_test \
        "Create Label: Missing ID" \
        "POST" \
        "$API_LABELS_URL/" \
        '{"name":"Test Label"}' \
        400 \
        "Creating label without ID should fail validation"
    
    # Test 12: Create label with invalid UUID
    run_validation_test \
        "Create Label: Invalid UUID" \
        "POST" \
        "$API_LABELS_URL/" \
        '{"id":"not-a-uuid","name":"Test Label"}' \
        400 \
        "Creating label with invalid UUID should fail validation"
    
    # Test 13: Create label with empty name
    run_validation_test \
        "Create Label: Empty Name" \
        "POST" \
        "$API_LABELS_URL/" \
        "{\"id\":\"$(uuidgen)\",\"name\":\"\"}" \
        400 \
        "Creating label with empty name should fail validation"
    
    # Test 14: Create label with name too long
    LONG_NAME=$(printf '%*s' 101 | tr ' ' 'a')
    run_validation_test \
        "Create Label: Name Too Long" \
        "POST" \
        "$API_LABELS_URL/" \
        "{\"id\":\"$(uuidgen)\",\"name\":\"$LONG_NAME\"}" \
        400 \
        "Creating label with name over 100 characters should fail"
fi

# ============================================================================
# Summary
# ============================================================================

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
        print_success "All Zod validation tests passed! ✓"
        print_info "Your API is properly validating requests with Zod."
        exit 0
    else
        print_warning "Some tests failed. Review the results above."
        print_info "Expected: All tests should return 400 (Bad Request)"
        exit 1
    fi
else
    print_error "No tests were run!"
    exit 1
fi

