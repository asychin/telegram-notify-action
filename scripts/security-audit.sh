#!/bin/bash

# Security Audit Script for telegram-notify-action
# Checks for potential shell injection vulnerabilities and dangerous patterns

set -e

echo "🔒 TELEGRAM-NOTIFY-ACTION SECURITY AUDIT"
echo "========================================"

errors=0

# Function to report errors
report_error() {
    echo "❌ ERROR: $1"
    echo "   File: $2"
    echo "   Line: $3"
    echo "   Content: $4"
    echo ""
    ((errors++))
}

# Function to report warnings  
report_warning() {
    echo "⚠️  WARNING: $1"
    echo "   File: $2"
    echo "   Line: $3"
    echo "   Content: $4"
    echo ""
}

echo "🔍 Checking for heredoc vulnerabilities..."

# Check for unsafe heredoc patterns
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
        # Check for heredoc with unquoted delimiters
        grep -n "<<[[:space:]]*EOF[^']" "$file" 2>/dev/null && \
            report_error "Unquoted heredoc delimiter found (shell injection risk)" "$file" "$(grep -n "<<[[:space:]]*EOF[^']" "$file" | cut -d: -f1)" "$(grep -n "<<[[:space:]]*EOF[^']" "$file" | cut -d: -f2-)"
        
        # Check for heredoc with EOF followed by variables
        grep -n -A5 "<<.*EOF" "$file" 2>/dev/null | grep '\${{' && \
            report_error "GitHub variables in heredoc content (shell injection risk)" "$file" "$(grep -n -A5 "<<.*EOF" "$file" | grep '\${{' | cut -d- -f1)" "$(grep -n -A5 "<<.*EOF" "$file" | grep '\${{' | cut -d- -f2-)"
    fi
done < <(find . -name "*.yml" -o -name "*.yaml" -print0)

echo "🔍 Checking for template_vars with GitHub variables..."

# Check for GitHub variables in template_vars JSON
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
        # Check for ${{ in template_vars context
        awk '/template_vars:/{flag=1} flag && /\$\{\{/{print NR ": " $0} /^[[:space:]]*[a-zA-Z_-]+:/ && !/template_vars:/ && flag{flag=0}' "$file" | while read -r line; do
            report_error "GitHub variables in template_vars JSON (injection risk)" "$file" "$(echo "$line" | cut -d: -f1)" "$(echo "$line" | cut -d: -f2-)"
        done
    fi
done < <(find . -name "*.yml" -o -name "*.yaml" -print0)

echo "🔍 Checking for mixed variable usage..."

# Check for mixing template variables with GitHub variables in message fields
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
        # Look for message: blocks that contain both {{ and ${{
        awk '/message:.*\|/{flag=1; block=""} flag{block=block $0 "\n"} /^[[:space:]]*[a-zA-Z_-]+:/ && !/message:/ && flag{if(block ~ /\{\{[^}$]/ && block ~ /\$\{\{/) print "Mixed variables in message block"; flag=0; block=""}' "$file" | while read -r result; do
            [[ -n "$result" ]] && report_error "Mixed template and GitHub variables in message" "$file" "multiple" "message block"
        done
    fi
done < <(find . -name "*.yml" -o -name "*.yaml" -print0)

echo "🔍 Checking for dangerous echo patterns..."

# Check for echo with unescaped variables
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
        grep -n 'echo.*\${{.*}}.*[>|]' "$file" 2>/dev/null | while read -r line; do
            if ! echo "$line" | grep -q '\\"'; then
                report_warning "Echo with GitHub variable to file (check escaping)" "$file" "$(echo "$line" | cut -d: -f1)" "$(echo "$line" | cut -d: -f2-)"
            fi
        done
    fi
done < <(find . -name "*.yml" -o -name "*.yaml" -print0)

echo "🔍 Checking for template variables in non-template contexts..."

# Check for {{ variables without template: field
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
        # Look for message: or caption: with {{ but no template: in same action
        awk '/uses:.*telegram-notify-action/{action=1; has_template=0; has_vars=0} action && /template:/{has_template=1} action && /(message|caption):.*\{\{/{has_vars=1} action && /^[[:space:]]*-/ && action{if(has_vars && !has_template) print "Template variables without template field"; action=0; has_template=0; has_vars=0}' "$file" | while read -r result; do
            [[ -n "$result" ]] && report_error "Template variables used without template: field" "$file" "action block" "message/caption with {{}}"
        done
    fi
done < <(find . -name "*.yml" -o -name "*.yaml" -print0)

echo ""
echo "📊 AUDIT SUMMARY"
echo "================"

if [ $errors -eq 0 ]; then
    echo "✅ No security vulnerabilities found!"
    echo "✅ All workflows follow security best practices"
    echo "✅ All variable usage is correct and safe"
else
    echo "❌ Found $errors security issues that need immediate attention!"
    echo "🚨 Please fix all errors before deploying to production"
    exit 1
fi

echo ""
echo "🔒 Security audit completed successfully"