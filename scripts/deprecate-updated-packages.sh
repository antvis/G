#!/bin/bash

# Script: deprecate-updated-packages.sh
# Description:
#   This script detects package version updates in the latest commit, deprecates the updated versions,
#   and maintains the 'latest' tag to point to the previous stable version. It only processes packages
#   where the version number has actually changed.
#
#   For each updated package, it will:
#   1. Verify if the version number has changed from the previous commit
#   2. If version changed, deprecate the current version
#   3. Update the 'latest' tag to point to the previous stable version
#
# Usage:
#   ./deprecate-updated-packages.sh [options]
#
# Options:
#   --dry-run            Show what would be deprecated without actually executing npm commands
#   --token=TOKEN        Use the provided npm authentication token
#   --registry=REGISTRY  Specify the npm registry (default: https://registry.npmjs.org/)
#   --help               Show this help message
#
# Examples:
#   # Dry run with default npm registry
#   ./deprecate-updated-packages.sh --dry-run
#
#   # Execute with custom registry and token
#   ./deprecate-updated-packages.sh --token=your-token --registry=https://your-registry.com/
#
#   # Using environment variables
#   NPM_TOKEN=your-token NPM_REGISTRY=https://your-registry.com/ ./deprecate-updated-packages.sh

# Initialize variables
DRY_RUN=false
NPM_TOKEN=""
NPM_REGISTRY="https://registry.npmjs.org/"
NPM_WEBSITE="https://www.npmjs.com"

# Statistics
TOTAL_PACKAGES=0
SUCCESS_COUNT=0
SUCCESS_PACKAGES=()
FAILED_PACKAGES=()

# Show help if requested
if [[ " $* " =~ " --help " ]] || [[ " $* " =~ " -h " ]]; then
    grep '^# ' "$0" | sed 's/^# //g'
    exit 0
fi

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
        DRY_RUN=true
        shift # past argument
        ;;
        --token=*)
        NPM_TOKEN="${arg#*=}"
        shift # past argument
        ;;
        --registry=*)
        NPM_REGISTRY="${arg#*=}"
        # Ensure registry URL ends with a slash
        [[ "$NPM_REGISTRY" != */ ]] && NPM_REGISTRY="$NPM_REGISTRY/"
        shift # past argument
        ;;
        *)
        # Unknown option
        echo "Unknown option: $arg"
        exit 1
        ;;
    esac
done

# Set npm registry
if [ -n "$NPM_TOKEN" ]; then
    echo "🔑 Using provided npm token"
    export NPM_TOKEN="$NPM_TOKEN"
fi
echo "🌐 Using npm registry: $NPM_REGISTRY"

echo "🔍 Checking for updated package.json files in the latest commit..."

# Get modified files in the latest commit and filter for packages/*/package.json
UPDATED_PACKAGES=$(git diff --name-only HEAD^ HEAD | grep '^packages/.*/package\.json$')

if [ -z "$UPDATED_PACKAGES" ]; then
    echo "ℹ️ No updated packages/*/package.json files found in the latest commit"
    exit 0
fi

echo "📦 Found the following updated package.json files:"
echo "$UPDATED_PACKAGES"
echo ""

# Process each updated package.json file
for PACKAGE_JSON in $UPDATED_PACKAGES; do
    # Get current package name and version
    PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_JSON")
    CURRENT_VERSION=$(jq -r '.version' "$PACKAGE_JSON")

    # Get the previous version from the parent commit
    PREVIOUS_VERSION=$(git show HEAD^:"$PACKAGE_JSON" | jq -r '.version' 2>/dev/null || echo "")

    # Skip if we couldn't get the previous version
    if [ -z "$PREVIOUS_VERSION" ] || [ "$PREVIOUS_VERSION" = "null" ]; then
        echo "⚠️  Could not determine previous version for $PACKAGE_JSON, skipping..."
        continue
    fi

    # Skip if version hasn't changed
    if [ "$CURRENT_VERSION" = "$PREVIOUS_VERSION" ]; then
        echo "ℹ️  Version not changed for $PACKAGE_NAME (still $CURRENT_VERSION), skipping..."
        continue
    fi

    # Increment total packages counter
    ((TOTAL_PACKAGES++))

    # Generate package URLs (npm website format)
    PACKAGE_URL="${NPM_WEBSITE}/package/${PACKAGE_NAME}/v/${CURRENT_VERSION}"
    PREVIOUS_PACKAGE_URL="${NPM_WEBSITE}/package/${PACKAGE_NAME}/v/${PREVIOUS_VERSION}"

    # For scoped packages, need to handle the @ symbol in the URL
    if [[ $PACKAGE_NAME == @* ]]; then
        PACKAGE_URL="${NPM_WEBSITE}/package/${PACKAGE_NAME/@/%40}/v/${CURRENT_VERSION}"
        PREVIOUS_PACKAGE_URL="${NPM_WEBSITE}/package/${PACKAGE_NAME/@/%40}/v/${PREVIOUS_VERSION}"
    fi

    if [ "$PACKAGE_NAME" = "null" ] || [ "$CURRENT_VERSION" = "null" ]; then
        echo "⚠️  Skipping invalid package.json: $PACKAGE_JSON"
        continue
    fi

    DEPRECATION_MESSAGE="This version has been deprecated. Please upgrade to the latest version."

    if [ "$DRY_RUN" = true ]; then
        echo "🔄 [DRY RUN] Would deprecate package: $PACKAGE_NAME@$CURRENT_VERSION"
        echo "   Previous version (latest tag would point to): $PACKAGE_NAME@$PREVIOUS_VERSION"
        echo "   Command: npm deprecate $PACKAGE_NAME@$CURRENT_VERSION \"$DEPRECATION_MESSAGE\""
        echo "   Package URL: $PACKAGE_URL"
        echo "   Previous version URL: $PREVIOUS_PACKAGE_URL"
        echo "✅ [DRY RUN] Success (simulated):"
        echo "   - Deprecated: $PACKAGE_NAME@$CURRENT_VERSION"
        echo "   - Latest tag would point to: $PACKAGE_NAME@$PREVIOUS_VERSION"
    else
        echo "🔄 Processing package: $PACKAGE_NAME"
        echo "   - Current version to deprecate: $CURRENT_VERSION"
        echo "   - Previous version (will be tagged as latest): $PREVIOUS_VERSION"
        echo "   Executing: npm deprecate $PACKAGE_NAME@$CURRENT_VERSION \"$DEPRECATION_MESSAGE\""
        echo "   Package URL: $PACKAGE_URL"
        echo "   Previous version URL: $PREVIOUS_PACKAGE_URL"

        # Execute npm deprecate command with registry and token if provided
        if [ -n "$NPM_TOKEN" ]; then
            npm --registry="$NPM_REGISTRY" --//${NPM_REGISTRY#*//}:_authToken="$NPM_TOKEN" deprecate "$PACKAGE_NAME@$CURRENT_VERSION" "$DEPRECATION_MESSAGE"
        else
            npm --registry="$NPM_REGISTRY" deprecate "$PACKAGE_NAME@$CURRENT_VERSION" "$DEPRECATION_MESSAGE"
        fi

        if [ $? -eq 0 ]; then
            echo "✅ Successfully deprecated: $PACKAGE_NAME@$CURRENT_VERSION"
            echo "   Package URL: $PACKAGE_URL"

            # Now, update the 'latest' tag to point to the previous version
            echo "🔄 Updating 'latest' tag to point to previous version: $PACKAGE_NAME@$PREVIOUS_VERSION"
            echo "   This will make version $PREVIOUS_VERSION the new 'latest' version"
            if [ -n "$NPM_TOKEN" ]; then
                npm --registry="$NPM_REGISTRY" --//${NPM_REGISTRY#*//}:_authToken="$NPM_TOKEN" dist-tag add "$PACKAGE_NAME@$PREVIOUS_VERSION" latest
            else
                npm --registry="$NPM_REGISTRY" dist-tag add "$PACKAGE_NAME@$PREVIOUS_VERSION" latest
            fi

            if [ $? -eq 0 ]; then
                echo "✅ Successfully updated 'latest' tag to point to $PACKAGE_NAME@$PREVIOUS_VERSION"
                echo "   Previous version URL: $PREVIOUS_PACKAGE_URL"
                ((SUCCESS_COUNT++))
                SUCCESS_PACKAGES+=("$PACKAGE_NAME@$CURRENT_VERSION (deprecated), latest -> $PREVIOUS_VERSION")
            else
                echo "❌ Failed to update 'latest' tag for $PACKAGE_NAME"
                FAILED_PACKAGES+=("$PACKAGE_NAME@$CURRENT_VERSION (deprecated, but failed to update latest tag)")
            fi
        else
            echo "❌ Failed to deprecate: $PACKAGE_NAME@$CURRENT_VERSION"
            echo "   Package URL: $PACKAGE_URL"
            FAILED_PACKAGES+=("$PACKAGE_NAME@$CURRENT_VERSION (failed to deprecate)")
        fi
    fi
    echo ""
done

if [ "$DRY_RUN" = true ]; then
    echo "✨ Dry run completed. No packages were actually deprecated."
    echo "📊 Would have processed $TOTAL_PACKAGES packages."
else
    echo "📊 Deprecation Summary:"
    echo "   ✅ Successfully deprecated: $SUCCESS_COUNT"
    echo "   ❌ Failed to deprecate: ${#FAILED_PACKAGES[@]}"
    echo "   📦 Total packages processed: $TOTAL_PACKAGES"

    if [ $SUCCESS_COUNT -gt 0 ]; then
        echo -e "\n✅ Successfully deprecated packages:"
        for pkg in "${SUCCESS_PACKAGES[@]}"; do
            # Extract package name and version
            pkg_name="${pkg%@*}"
            pkg_version="${pkg#*@}"
            # Encode package name for URL (only @ and / need to be encoded)
            encoded_pkg=$(echo "$pkg_name" | sed 's/@/%40/g' | sed 's/\//%2F/g')
            echo "   - $pkg (${NPM_WEBSITE}/package/${encoded_pkg}/v/${pkg_version})"
        done
    fi

    if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
        echo -e "\n❌ Failed packages:"
        for pkg in "${FAILED_PACKAGES[@]}"; do
            # Extract package name and version
            pkg_name="${pkg%@*}"
            pkg_version="${pkg#*@}"
            # Encode package name for URL (only @ and / need to be encoded)
            encoded_pkg=$(echo "$pkg_name" | sed 's/@/%40/g' | sed 's/\//%2F/g')
            echo "   - $pkg (${NPM_WEBSITE}/package/${encoded_pkg}/v/${pkg_version})"
        done
    fi

    if [ $SUCCESS_COUNT -eq $TOTAL_PACKAGES ]; then
        echo "\n✨ All $TOTAL_PACKAGES packages were processed successfully!"
    else
        echo "\n⚠️  Some packages failed to deprecate. See above for details."
    fi
fi