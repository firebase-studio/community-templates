{ pkgs, app_key, api_key, ... }: {
  packages = [
    pkgs.curl
    pkgs.gzip
    pkgs.gnutar
    pkgs.jq
  ];

  bootstrap = ''
    set -eo pipefail

    # Copy this template into the workspace output directory
    cp -rf ${./.} "$out"
    chmod -R +w "$out"
    rm -rf "$out/.git" "$out/idx-template".{nix,json}
    cd "$out"

    tmpdir="$(mktemp -d)"
    trap 'rm -rf "$tmpdir"' EXIT

    mods_tgz="$tmpdir/node_modules.tgz"

    # Pull ONLY node_modules from GitHub release (repo content is already included in this template)
    curl -fL --retry 3 --retry-delay 1 --compressed \
      "https://github.com/choicely/firebase-studio-template/releases/download/v1.0.0-alpha/node_modules-linux-x86_64-node20.tar.gz" \
      -o "$mods_tgz"

    # Extract node_modules into workspace (don't fail if some files already exist)
    tar -xzf "$mods_tgz" --keep-old-files >/dev/null 2>&1 || true

    chmod -R a+x scripts || true

    # Ensure newline before appending
    echo "" >> default.env

    printf '%s="%s"\n' "CHOICELY_APP_NAME" "$WS_NAME" >> default.env
    printf '%s=%s\n' "CHOICELY_APP_KEY" "${app_key}" >> default.env
    printf '%s=%s\n' "CHOICELY_API_KEY" "${api_key}" >> .env

    jq --arg app_key "${app_key}" --arg api_key "${api_key}" \
      '.mcpServers."choicely-backend-http".headers."X-Choicely-App-Key" = $app_key
       | .mcpServers."choicely-backend-http".headers.Authorization = "Bearer " + $api_key' \
      .idx/mcp.json > .idx/mcp.json.tmp && mv .idx/mcp.json.tmp .idx/mcp.json
  '';
}
