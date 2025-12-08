#!/bin/bash

# Usage: ./script.sh [-o output_file.sh]
# If -o is provided, commands are written to the output file instead of stdout

output_file=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -o)
            output_file="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [-o output_file.sh]"
            exit 1
            ;;
    esac
done

# Convert output_file to absolute path if specified
if [ -n "$output_file" ]; then
    # If it's a relative path, make it absolute based on current directory
    if [[ "$output_file" != /* ]]; then
        output_file="$(cd "$(dirname "$output_file")" && pwd)/$(basename "$output_file")"
    fi
fi

# Function to output diagnostic messages (always to stderr)
diagnostic() {
    echo "$1" >&2
}

# Function to output commands/content to file
output() {
    if [ -n "$output_file" ]; then
        echo "$1" >> "$output_file"
    fi
}

# Initialize output file if specified
if [ -n "$output_file" ]; then
    cat > "$output_file" << 'EOF'
#!/bin/bash
# Auto-generated React 19 and Next.js update script
# Address React 19 critical vulnerability (CVE-2025-55182)
# Generated: $(date)

set -e  # Exit on error

echo "=========================================="
echo "React 19 & Next.js Update Script"
echo "=========================================="
echo ""

EOF
    chmod +x "$output_file"
    diagnostic "📝 Generating update commands to: $output_file"
    diagnostic ""
fi

# Print header message (only to console, not to output file)
if [ -z "$output_file" ]; then
    diagnostic "=========================================="
    diagnostic "React 19 & Next.js Update Scanner"
    diagnostic "CVE-2025-55182 Vulnerability Patch"
    diagnostic "=========================================="
    diagnostic ""
fi

project_count=0
package_count=0

# Find all one-level deep sub-directories containing package.json
# Use process substitution to avoid subshell
while read -r dir; do
    diagnostic "✓ Checking packages in: $dir"

    # Save current directory
    current_dir=$(pwd)

    # Change to target directory
    if ! cd "$dir"; then
        diagnostic "    ⚠ Failed to change to directory: $dir"
        continue
    fi

    # Array to collect packages to update
    packages_to_update=()

    # Check if React 19 exists in dependencies (using grep instead of jq)
    if grep -q '"react"\s*:\s*"19' package.json 2>/dev/null; then
        diagnostic "    ✓ Found react 19 in dependencies"
        packages_to_update+=("react@19.2.1")
    fi

    # Check if react-dom 19 exists in dependencies
    if grep -q '"react-dom"\s*:\s*"19' package.json 2>/dev/null; then
        diagnostic "    ✓ Found react-dom 19 in dependencies"
        packages_to_update+=("react-dom@19.2.1")
    fi

    # Check if next exists in dependencies (any version)
    if grep -q '"next"\s*:' package.json 2>/dev/null; then
        diagnostic "    ✓ Found next in dependencies"
        packages_to_update+=("next@latest")
    fi

    # Update packages if any were found
    if [ ${#packages_to_update[@]} -gt 0 ]; then
        diagnostic ""
        diagnostic "  📦 Packages identified for update: ${packages_to_update[*]}"
        diagnostic ""
        diagnostic "  🔧 Execute the following command:"
        diagnostic ""

        # Format the actual directory path (relative from root)
        relative_dir=$(echo "$dir" | sed 's|^\./||')

        if [ -n "$output_file" ]; then
            # For output file: write as actual executable shell commands (not echo statements)
            echo "echo 'Updating: $relative_dir'" >> "$output_file"
            echo "cd \"$relative_dir\" && pnpm up ${packages_to_update[*]}" >> "$output_file"
            echo "cd - > /dev/null" >> "$output_file"
            echo "" >> "$output_file"
        else
            # For console: show the command to copy
            diagnostic "     cd \"$dir\" && pnpm up ${packages_to_update[*]}"
            diagnostic ""
        fi

        diagnostic "  ─────────────────────────────────────────────────"
        diagnostic ""
    else
        diagnostic "    ⊘ No relevant packages found - skipping"
        diagnostic ""
    fi

    # Return to original directory
    cd "$current_dir" || true
done < <(find . -mindepth 2 -maxdepth 2 -type f -name "package.json" -exec dirname {} \;)

output "=========================================="
output "✅ Scan Complete"
output "=========================================="
output ""
output "📋 Summary:"
output "  • Review the commands above"
output "  • Execute each command to update packages"
output "  • Verify tests pass after updates"
output ""

diagnostic "=========================================="
diagnostic "✅ Scan Complete"
diagnostic "=========================================="
diagnostic ""
diagnostic "📋 Summary:"
diagnostic "  • Review the commands above"
diagnostic "  • Execute each command to update packages"
diagnostic "  • Verify tests pass after updates"
diagnostic ""

if [ -n "$output_file" ]; then
    output "echo ''"
    output "echo '✅ Update script completed successfully'"
    diagnostic ""
    diagnostic "✅ Generated script: $output_file"
    diagnostic "   Run it with: bash $output_file"
fi
