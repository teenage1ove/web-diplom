#!/bin/bash

echo "=== Testing Cookie Authentication Flow ==="
echo ""

# Step 1: Login and save cookies
echo "1. Login and save cookies..."
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' \
  -c cookies.txt \
  -v 2>&1 | grep -E "(Set-Cookie|< HTTP)"

echo ""
echo "2. Check saved cookies:"
cat cookies.txt

echo ""
echo "3. Test /auth/me with cookies:"
curl -X GET http://localhost:5001/api/v1/auth/me \
  -b cookies.txt \
  -v 2>&1 | grep -E "(Cookie:|< HTTP|user)"

